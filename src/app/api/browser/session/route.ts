import { randomUUID } from "crypto";
import { BrowserCapacityError, getBrowserSessionManager } from "@/lib/browser-session-manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.BROWSER_SESSION_TOKEN;
  if (!expectedToken && process.env.NODE_ENV !== "production") return true;
  if (!expectedToken) return false;

  const auth = request.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  const headerToken = request.headers.get("x-browser-session-token");

  return bearerToken === expectedToken || headerToken === expectedToken;
}

function unauthorizedResponse() {
  return Response.json(
    { ok: false, error: "Browser session API desativada ou token invalido." },
    { status: 401 },
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const manager = getBrowserSessionManager();
  const health = await manager.getHealth();
  return Response.json({
    ok: true,
    health,
    sessions: manager.listSessions(),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
  };
  const sessionId = body.sessionId?.trim() || randomUUID();

  try {
    await getBrowserSessionManager().createSession(sessionId);
    const session = getBrowserSessionManager().getSession(sessionId);
    return Response.json({ ok: true, session });
  } catch (err) {
    if (err instanceof BrowserCapacityError) {
      return Response.json({ ok: false, error: err.message }, { status: 429 });
    }

    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  let sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    const body = (await request.json().catch(() => ({}))) as {
      sessionId?: string;
    };
    sessionId = body.sessionId ?? null;
  }

  if (!sessionId) {
    return Response.json({ ok: false, error: "sessionId obrigatorio." }, { status: 400 });
  }

  await getBrowserSessionManager().closeSession(sessionId, "api-delete");
  return Response.json({ ok: true, sessionId });
}
