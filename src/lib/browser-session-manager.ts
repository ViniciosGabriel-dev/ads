import puppeteer, { type Browser, type BrowserContext, type Page } from "puppeteer-core";
import { chromeLaunchArgs, findChrome, shouldRunHeadless } from "@/lib/chrome";

type BrowserSessionStatus = "active" | "closing" | "expired";

type BrowserSession = {
  sessionId: string;
  context: BrowserContext;
  page: Page;
  createdAt: number;
  lastUsedAt: number;
  expiresAt: number;
  status: BrowserSessionStatus;
};

type BrowserHealth = {
  app: "ok";
  browser: "ok" | "down";
  activeSessions: number;
  maxSessions: number;
  keepAliveMs: number;
  memoryMb: number;
  uptimeSeconds: number;
};

export class BrowserCapacityError extends Error {
  constructor(maxSessions: number) {
    super(`Limite de ${maxSessions} sessoes Puppeteer ativas atingido.`);
    this.name = "BrowserCapacityError";
  }
}

const DEFAULT_MAX_SESSIONS = 5;
const DEFAULT_IDLE_MS = 180_000;
const DEFAULT_TTL_MS = 600_000;
const DEFAULT_CLEANUP_INTERVAL_MS = 30_000;
const DEFAULT_BROWSER_KEEP_ALIVE_MS = 600_000;
const DEFAULT_PAGE_TIMEOUT_MS = 15_000;
const DEFAULT_NAVIGATION_TIMEOUT_MS = 20_000;

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export class BrowserSessionManager {
  private browser: Browser | null = null;
  private launchPromise: Promise<Browser> | null = null;
  private readonly sessions = new Map<string, BrowserSession>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly startedAt = Date.now();
  private lastSessionClosedAt = Date.now();

  readonly maxSessions = readPositiveInt("MAX_BROWSER_SESSIONS", DEFAULT_MAX_SESSIONS);
  private readonly idleMs = readPositiveInt("BROWSER_SESSION_IDLE_MS", DEFAULT_IDLE_MS);
  private readonly ttlMs = readPositiveInt("BROWSER_SESSION_TTL_MS", DEFAULT_TTL_MS);
  private readonly cleanupIntervalMs = readPositiveInt("BROWSER_CLEANUP_INTERVAL_MS", DEFAULT_CLEANUP_INTERVAL_MS);
  private readonly keepAliveMs = readPositiveInt("BROWSER_KEEP_ALIVE_MS", DEFAULT_BROWSER_KEEP_ALIVE_MS);
  private readonly pageTimeoutMs = readPositiveInt("BROWSER_PAGE_TIMEOUT_MS", DEFAULT_PAGE_TIMEOUT_MS);
  private readonly navigationTimeoutMs = readPositiveInt("BROWSER_NAVIGATION_TIMEOUT_MS", DEFAULT_NAVIGATION_TIMEOUT_MS);

  constructor() {
    this.startCleanup();
  }

  async createSession(sessionId: string): Promise<BrowserSession> {
    await this.cleanupExpiredSessions();

    const existing = this.sessions.get(sessionId);
    if (existing && existing.status === "active") {
      this.touchSession(sessionId);
      return existing;
    }

    if (this.activeSessionCount() >= this.maxSessions) {
      console.warn("[browser-manager] capacity reached", {
        sessionId,
        activeSessions: this.activeSessionCount(),
        maxSessions: this.maxSessions,
      });
      throw new BrowserCapacityError(this.maxSessions);
    }

    const browser = await this.ensureBrowser();
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    page.setDefaultTimeout(this.pageTimeoutMs);
    page.setDefaultNavigationTimeout(this.navigationTimeoutMs);
    const now = Date.now();
    const session: BrowserSession = {
      sessionId,
      context,
      page,
      createdAt: now,
      lastUsedAt: now,
      expiresAt: now + this.ttlMs,
      status: "active",
    };

    this.sessions.set(sessionId, session);
    console.log("[browser-manager] session created", {
      sessionId,
      activeSessions: this.activeSessionCount(),
      maxSessions: this.maxSessions,
    });
    return session;
  }

  async getPage(sessionId: string): Promise<Page | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return null;

    if (this.isExpired(session, Date.now())) {
      await this.closeSession(sessionId, "expired-on-access");
      return null;
    }

    this.touchSession(sessionId);
    return session.page;
  }

  touchSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return;
    session.lastUsedAt = Date.now();
  }

  async closeSession(sessionId: string, reason = "manual"): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    if (session.status === "closing") return;
    session.status = reason.includes("expired") ? "expired" : "closing";

    try {
      await session.page.close().catch(() => {});
      await session.context.close().catch(() => {});
    } finally {
      this.sessions.delete(sessionId);
      if (this.activeSessionCount() === 0) this.lastSessionClosedAt = Date.now();
      console.log("[browser-manager] session closed", {
        sessionId,
        reason,
        activeSessions: this.activeSessionCount(),
      });
    }
  }

  async getHealth(): Promise<BrowserHealth> {
    try {
      await this.ensureBrowser();
    } catch (err) {
      console.error("[browser-manager] healthcheck failed", err);
      this.browser = null;
    }

    return {
      app: "ok",
      browser: this.browser ? "ok" : "down",
      activeSessions: this.activeSessionCount(),
      maxSessions: this.maxSessions,
      keepAliveMs: this.keepAliveMs,
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
    };
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser) {
      try {
        await this.browser.version();
        return this.browser;
      } catch {
        this.browser = null;
      }
    }

    if (this.launchPromise) return this.launchPromise;

    this.launchPromise = this.launchBrowser();
    try {
      this.browser = await this.launchPromise;
      return this.browser;
    } finally {
      this.launchPromise = null;
    }
  }

  private async launchBrowser(): Promise<Browser> {
    const executablePath = findChrome();
    if (!executablePath) throw new Error("Chrome/Chromium nao encontrado.");

    console.log("[browser-manager] launching browser", { executablePath });
    return puppeteer.launch({
      headless: shouldRunHeadless(),
      executablePath,
      defaultViewport: null,
      ignoreDefaultArgs: ["--enable-automation"],
      args: chromeLaunchArgs(),
    });
  }

  private async checkBrowser(): Promise<void> {
    if (!this.browser) return;

    try {
      await this.browser.version();
    } catch {
      console.warn("[browser-manager] browser is down, clearing sessions");
      this.browser = null;
      this.sessions.clear();
    }
  }

  private startCleanup(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpiredSessions().catch((err) => {
        console.error("[browser-manager] cleanup failed", err);
      });
    }, this.cleanupIntervalMs);

    this.cleanupTimer.unref();
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessionIds = [...this.sessions.values()]
      .filter((session) => this.isExpired(session, now))
      .map((session) => session.sessionId);

    for (const sessionId of expiredSessionIds) {
      await this.closeSession(sessionId, "expired");
    }

    await this.checkBrowser();
    await this.closeIdleBrowser(now);
  }

  private isExpired(session: BrowserSession, now: number): boolean {
    return now >= session.expiresAt || now - session.lastUsedAt >= this.idleMs;
  }

  private activeSessionCount(): number {
    return [...this.sessions.values()].filter((session) => session.status === "active").length;
  }

  private async closeIdleBrowser(now: number): Promise<void> {
    if (!this.browser || this.activeSessionCount() > 0) return;
    if (now - this.lastSessionClosedAt < this.keepAliveMs) return;

    console.log("[browser-manager] closing idle browser", {
      keepAliveMs: this.keepAliveMs,
    });
    await this.browser.close().catch(() => {});
    this.browser = null;
  }
}

export function getBrowserSessionManager(): BrowserSessionManager {
  const g = globalThis as typeof globalThis & {
    __browserSessionManager?: BrowserSessionManager;
  };

  if (!g.__browserSessionManager) {
    g.__browserSessionManager = new BrowserSessionManager();
  }

  return g.__browserSessionManager;
}
