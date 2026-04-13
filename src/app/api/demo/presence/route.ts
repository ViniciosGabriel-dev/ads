import { getPresenceSummary, leave, ping } from "@/lib/presence";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getPresenceSummary());
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | { action: "ping"; pageId: string; page: string }
    | { action: "leave"; pageId: string };

  const ua = request.headers.get("user-agent") ?? "";
  const device = detectDevice(ua);

  if (body.action === "ping") {
    ping(body.pageId, body.page, device);
    return Response.json({ ok: true });
  }

  leave(body.pageId);
  return Response.json({ ok: true });
}

function detectDevice(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Desconhecido";
}
