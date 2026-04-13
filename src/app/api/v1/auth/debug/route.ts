import { getPhantomDebugState, getPhantomScreenshot } from "@/lib/phantom";

export const dynamic = "force-dynamic";

function isDebugRequestAllowed(request: Request): boolean {
  if (process.env.PHANTOM_DEBUG !== "1") return false;

  const expectedToken = process.env.PHANTOM_DEBUG_TOKEN;
  if (!expectedToken) return true;

  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? request.headers.get("x-debug-token");
  return token === expectedToken;
}

export async function GET(request: Request) {
  if (!isDebugRequestAllowed(request)) {
    return Response.json({ ok: false, error: "phantom debug disabled" }, { status: 403 });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json({ ok: false, error: "missing sessionId" }, { status: 400 });
  }

  if (url.searchParams.get("format") === "view") {
    const token = url.searchParams.get("token") ?? "";
    const sessionIdJson = JSON.stringify(sessionId);
    const tokenJson = JSON.stringify(token);

    return new Response(
      `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Phantom debug</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #101214; color: #f4f4f4; }
    header { padding: 12px 16px; background: #1b1f23; border-bottom: 1px solid #30363d; }
    main { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; padding: 16px; }
    img { display: block; width: 100%; max-height: calc(100vh - 96px); object-fit: contain; background: #000; border: 1px solid #30363d; }
    aside { overflow: auto; max-height: calc(100vh - 96px); }
    pre { white-space: pre-wrap; word-break: break-word; background: #1b1f23; padding: 12px; border: 1px solid #30363d; }
    .muted { color: #9ca3af; }
    @media (max-width: 900px) { main { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <strong>Phantom debug</strong>
    <span class="muted" id="status">carregando...</span>
  </header>
  <main>
    <img id="screen" alt="Tela atual do Puppeteer" />
    <aside>
      <pre id="state">{}</pre>
    </aside>
  </main>
  <script>
    const sessionId = ${sessionIdJson};
    const token = ${tokenJson};
    const auth = token ? "&token=" + encodeURIComponent(token) : "";
    const screen = document.getElementById("screen");
    const state = document.getElementById("state");
    const status = document.getElementById("status");

    async function tick() {
      const bust = Date.now();
      screen.src = "/api/v1/auth/debug?sessionId=" + encodeURIComponent(sessionId) + "&format=image" + auth + "&_=" + bust;

      try {
        const res = await fetch("/api/v1/auth/debug?sessionId=" + encodeURIComponent(sessionId) + auth + "&_=" + bust, { cache: "no-store" });
        const json = await res.json();
        state.textContent = JSON.stringify(json, null, 2);
        status.textContent = json.url ? " " + json.url : " sem pagina";
      } catch (err) {
        state.textContent = String(err);
        status.textContent = " erro ao atualizar";
      }
    }

    tick();
    setInterval(tick, 1000);
  </script>
</body>
</html>`,
      {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/html; charset=utf-8",
        },
      },
    );
  }

  if (url.searchParams.get("format") === "image") {
    const screenshot = await getPhantomScreenshot(sessionId);
    if (!screenshot) {
      return Response.json({ ok: false, error: "screenshot unavailable" }, { status: 404 });
    }
    const body = new ArrayBuffer(screenshot.byteLength);
    new Uint8Array(body).set(screenshot);

    return new Response(body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "image/png",
      },
    });
  }

  const state = await getPhantomDebugState(sessionId);
  return Response.json(state, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
