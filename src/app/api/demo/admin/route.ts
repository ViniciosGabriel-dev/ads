import {
  deleteSession,
  getAllSessions,
  releaseTwoFactor,
  resetDemoSession,
  updateTwoFactorType,
} from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getAllSessions());
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | { action: "reset"; sessionId: string }
    | { action: "delete"; sessionId: string }
    | { action: "setTwoFactorType"; sessionId: string; type: "sms" | "email" | "authenticator" }
    | { action: "releaseTwoFactor"; sessionId: string; type: "sms" | "email" | "authenticator" };

  if (body.action === "reset") {
    resetDemoSession(body.sessionId);
    return Response.json(getAllSessions());
  }
  if (body.action === "delete") {
    deleteSession(body.sessionId);
    return Response.json(getAllSessions());
  }
  if (body.action === "setTwoFactorType") {
    updateTwoFactorType(body.sessionId, body.type);
    return Response.json(getAllSessions());
  }
  releaseTwoFactor(body.sessionId, body.type);
  return Response.json(getAllSessions());
}
