import { getBrowserSessionManager } from "@/lib/browser-session-manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const health = await getBrowserSessionManager().getHealth();
  return Response.json(health, {
    status: health.browser === "ok" ? 200 : 503,
  });
}
