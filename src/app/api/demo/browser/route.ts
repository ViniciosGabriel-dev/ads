import puppeteer from "puppeteer-core";
import { spawn } from "child_process";
import { chromeLaunchArgs, findChrome, shouldRunHeadless } from "@/lib/chrome";

export const dynamic = "force-dynamic";

const CHROME_URL = process.env.CDP_CHROME_URL ?? "http://localhost:9222";
const USER_DATA_DIR = process.env.CDP_USER_DATA_DIR ?? (process.platform === "win32" ? "C:\\temp\\chrome-cdp" : "/tmp/chrome-cdp");
const TARGET_URL = process.env.CDP_TARGET_URL ?? "https://accounts.google.com";

// sessionId → Chrome targetId
const tabRegistry = (() => {
  const g = globalThis as typeof globalThis & { __tabRegistry?: Map<string, string> };
  if (!g.__tabRegistry) g.__tabRegistry = new Map();
  return g.__tabRegistry;
})();

function chromeDebugPort(): string {
  try {
    return new URL(CHROME_URL).port || "9222";
  } catch {
    return "9222";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setTabTitle(page: any, label: string) {
  if (!page) return;
  try {
    await page.evaluate((l: string) => { document.title = l; }, label);
  } catch { /* página pode ainda estar carregando */ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTargetId(page: any): Promise<string> {
  const client = await page.createCDPSession();
  const { targetInfo } = await client.send("Target.getTargetInfo");
  await client.detach();
  return targetInfo.targetId as string;
}

async function getPageForSession(sessionId: string) {
  const browser = await puppeteer.connect({ browserURL: CHROME_URL });
  const targetId = tabRegistry.get(sessionId);

  let page = null;

  if (targetId) {
    const pages = await browser.pages();
    for (const p of pages) {
      try {
        const id = await getTargetId(p);
        if (id === targetId) { page = p; break; }
      } catch { /* ignora */ }
    }
  }

  // Fallback: any accounts.google.com tab
  if (!page) {
    const pages = await browser.pages();
    page = pages.find((p) => p.url().includes("accounts.google.com")) ?? pages[0] ?? null;
  }

  return { browser, page };
}

export async function GET() {
  try {
    const res = await fetch(`${CHROME_URL}/json/version`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    const data = (await res.json()) as { Browser?: string };
    return Response.json({ connected: true, browser: data.Browser ?? "Chrome" });
  } catch {
    return Response.json({ connected: false });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | { action: "launch"; sessionId: string; label?: string }
    | { action: "retitle"; sessionId: string; label: string }
    | { action: "fill"; sessionId: string; selector: string; value: string; pressEnter?: boolean }
    | { action: "click"; sessionId: string; selector: string };

  // ── Launch Chrome / open new tab ──────────────────────────────────────────
  if (body.action === "launch") {
    // Try to connect to an already-running Chrome
    try {
      const browser = await puppeteer.connect({ browserURL: CHROME_URL });
      const page = await browser.newPage();
      await page.goto(TARGET_URL);
      const targetId = await getTargetId(page);
      tabRegistry.set(body.sessionId, targetId);
      await setTabTitle(page, body.label ?? `Sessão ${body.sessionId.slice(0, 6)}`);
      browser.disconnect();
      return Response.json({ ok: true, reused: true });
    } catch {
      // Chrome not running — spawn it
    }

    const chromePath = findChrome();
    if (!chromePath) {
      return Response.json({ ok: false, error: "Chrome não encontrado. Instale o Google Chrome." });
    }

    spawn(
      chromePath,
      [
        `--remote-debugging-port=${chromeDebugPort()}`,
        `--user-data-dir=${USER_DATA_DIR}`,
        ...(shouldRunHeadless() ? ["--headless=new"] : []),
        ...chromeLaunchArgs(),
        TARGET_URL,
      ],
      { detached: true, stdio: "ignore" },
    ).unref();

    // Wait for Chrome to start, then register the tab
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const browser = await puppeteer.connect({ browserURL: CHROME_URL });
      const pages = await browser.pages();
      const page = pages.find((p) => p.url().includes("accounts.google.com")) ?? pages[0];
      if (page) {
        tabRegistry.set(body.sessionId, await getTargetId(page));
        await setTabTitle(page, body.label ?? `Sessão ${body.sessionId.slice(0, 6)}`);
      }
      browser.disconnect();
    } catch {
      // Will be picked up on next fill attempt via fallback
    }

    return Response.json({ ok: true, reused: false });
  }

  // ── Retitle tab ───────────────────────────────────────────────────────────
  if (body.action === "retitle") {
    let browser;
    try {
      const conn = await getPageForSession(body.sessionId);
      browser = conn.browser;
      await setTabTitle(conn.page, body.label);
      browser.disconnect();
      return Response.json({ ok: true });
    } catch (err) {
      browser?.disconnect();
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      return Response.json({ ok: false, error: message });
    }
  }

  // ── Fill / Click ──────────────────────────────────────────────────────────
  let browser;
  try {
    const conn = await getPageForSession(body.sessionId);
    browser = conn.browser;
    const page = conn.page;

    if (!page) {
      return Response.json({ ok: false, error: "Nenhuma aba encontrada para essa sessão" });
    }

    if (body.action === "fill") {
      await page.$eval(
        body.selector,
        (el, value) => {
          const input = el as HTMLInputElement;
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          )?.set;
          nativeInputValueSetter?.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        },
        body.value,
      );

      if (body.pressEnter) {
        await page.keyboard.press("Enter");
      }
    }

    if (body.action === "click") {
      await page.click(body.selector);
    }

    browser.disconnect();
    return Response.json({ ok: true });
  } catch (err) {
    browser?.disconnect();
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return Response.json({ ok: false, error: message });
  }
}
