# Deploy do Puppeteer no Railway

Este projeto usa Docker no Railway para ter Chromium instalado no mesmo container do Next.js.

## Variaveis recomendadas

Configure no Railway em **Variables**:

```txt
NODE_ENV=production
CHROME_EXECUTABLE_PATH=/usr/bin/chromium
PUPPETEER_HEADLESS=true
CDP_CHROME_URL=http://localhost:9222
CDP_USER_DATA_DIR=/tmp/chrome-cdp
MAX_BROWSER_SESSIONS=5
BROWSER_SESSION_IDLE_MS=180000
BROWSER_SESSION_TTL_MS=600000
BROWSER_CLEANUP_INTERVAL_MS=30000
BROWSER_KEEP_ALIVE_MS=600000
BROWSER_PAGE_TIMEOUT_MS=15000
BROWSER_NAVIGATION_TIMEOUT_MS=20000
```

O Railway fornece `PORT` automaticamente. O Dockerfile expoe `3000`, mas o servidor Next standalone usa o `PORT` recebido em runtime.

## Deploy

1. Crie um novo projeto no Railway.
2. Conecte este repositorio GitHub.
3. Confirme que o Railway detectou o `Dockerfile`.
4. Adicione as variaveis acima.
5. Faca o deploy.

## Recursos

No plano Hobby, use 1 replica e aumente RAM/CPU antes de adicionar replicas. Comece com 4 GB de RAM e `MAX_BROWSER_SESSIONS=5`. Se estiver estavel, teste aumentar gradualmente.

## Verificacao

Depois do deploy, teste:

```txt
GET /api/v1/connect
```

A resposta esperada quando o Chrome estiver acessivel e:

```json
{ "connected": true, "browser": "Chrome/..." }
```

Se retornar `connected: false`, verifique os logs do Railway e confirme se `CHROME_EXECUTABLE_PATH=/usr/bin/chromium` esta configurado.

Para checar a infraestrutura generica de sessoes Puppeteer:

```txt
GET /api/browser/health
```

Resposta esperada:

```json
{
  "app": "ok",
  "browser": "ok",
  "activeSessions": 0,
  "maxSessions": 5,
  "keepAliveMs": 600000,
  "memoryMb": 512,
  "uptimeSeconds": 60
}
```

## Desenvolvimento local com config parecida

No Windows/WSL sem Chromium Linux instalado, use o Chrome do Windows no `.env.local`:

```txt
CDP_CHROME_URL=http://localhost:9222
CDP_USER_DATA_DIR=/tmp/chrome-cdp
CHROME_EXECUTABLE_PATH=/mnt/c/Program Files/Google/Chrome/Application/chrome.exe
NODE_ENV=production
PUPPETEER_HEADLESS=true

MAX_BROWSER_SESSIONS=5
BROWSER_SESSION_IDLE_MS=180000
BROWSER_SESSION_TTL_MS=600000
BROWSER_CLEANUP_INTERVAL_MS=30000
BROWSER_KEEP_ALIVE_MS=600000
BROWSER_PAGE_TIMEOUT_MS=15000
BROWSER_NAVIGATION_TIMEOUT_MS=20000
```

Se instalar Chromium no Linux/WSL, use:

```txt
CHROME_EXECUTABLE_PATH=/usr/bin/chromium
```

Rode localmente com:

```bash
npm run dev
```

E teste:

```txt
http://localhost:3000/api/browser/health
```
