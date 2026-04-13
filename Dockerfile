FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium
ENV CDP_USER_DATA_DIR=/tmp/chrome-cdp
ENV PUPPETEER_HEADLESS=true
ENV MAX_BROWSER_SESSIONS=5
ENV BROWSER_SESSION_IDLE_MS=180000
ENV BROWSER_SESSION_TTL_MS=600000
ENV BROWSER_CLEANUP_INTERVAL_MS=30000
ENV BROWSER_KEEP_ALIVE_MS=600000
ENV BROWSER_PAGE_TIMEOUT_MS=15000
ENV BROWSER_NAVIGATION_TIMEOUT_MS=20000
ENV PHANTOM_SESSION_TTL_MS=600000

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    dumb-init \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["dumb-init", "node", "server.js"]
