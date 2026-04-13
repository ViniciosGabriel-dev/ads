import { existsSync } from "fs";

const CHROME_PATHS = [
  process.env.CHROME_EXECUTABLE_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.USERNAME
    ? `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`
    : undefined,
].filter(Boolean) as string[];

export function findChrome(): string | null {
  return CHROME_PATHS.find((p) => existsSync(p)) ?? null;
}

export function shouldRunHeadless(): boolean {
  const value = process.env.PUPPETEER_HEADLESS ?? process.env.CHROME_HEADLESS;
  if (value) return value !== "false";
  return process.platform !== "win32";
}

export function chromeLaunchArgs(extraArgs: string[] = []): string[] {
  return [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--disable-blink-features=AutomationControlled",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-domain-reliability",
    "--disable-extensions",
    "--disable-infobars",
    "--disable-sync",
    "--metrics-recording-only",
    "--mute-audio",
    "--window-size=1280,800",
    "--no-first-run",
    "--no-default-browser-check",
    // Stealth extras
    "--disable-features=IsolateOrigins,site-per-process",
    "--lang=pt-BR,pt",
    "--disable-ipc-flooding-protection",
    "--password-store=basic",
    "--use-mock-keychain",
    ...extraArgs,
  ];
}
