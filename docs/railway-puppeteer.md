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
MAX_BROWSER_SESSIONS=3
BROWSER_SESSION_IDLE_MS=120000
BROWSER_SESSION_TTL_MS=300000
BROWSER_CLEANUP_INTERVAL_MS=30000
```

O Railway fornece `PORT` automaticamente. O Dockerfile expoe `3000`, mas o servidor Next standalone usa o `PORT` recebido em runtime.

## Deploy

1. Crie um novo projeto no Railway.
2. Conecte este repositorio GitHub.
3. Confirme que o Railway detectou o `Dockerfile`.
4. Adicione as variaveis acima.
5. Faca o deploy.

## Recursos

Comece com pelo menos 2 GB de RAM. Para varias abas/sessoes simultaneas, use 4 GB ou mais.

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
  "maxSessions": 3,
  "memoryMb": 512,
  "uptimeSeconds": 60
}
```
