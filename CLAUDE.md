# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment

Requires a `DATABASE_URL` env var pointing to a Neon PostgreSQL instance. The `src/lib/db.ts` module is `server-only` and calls `setupTable()` to create the `credenciais` table on first use.

## Architecture

**Stack:** Next.js 16.2.2 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Neon (serverless Postgres)

### Routes

| Path | Description |
|------|-------------|
| `/` | Marketing landing page (all sections composed in `src/app/page.tsx`) |
| `/signin` | Multi-step credential capture form (client component) |
| `/admin` | Real-time admin dashboard showing session state |
| `/api/demo/session` | GET/POST — user-facing session state mutations |
| `/api/demo/admin` | GET/POST — admin controls (release 2FA, reset, set type) |
| `/articles`, `/campaign-types/search`, `/cost`, `/goals`, `/how-it-works`, `/start`, `/support` | Static marketing sub-pages |

### Session state

`src/lib/demo-session.ts` holds all business logic and state in **`globalThis.__demoStore`** (in-memory, resets on server restart). It is imported by both API routes — never by client components. The `DemoSession` type is the single shared contract between server and client.

The sign-in flow progresses through steps: `email → password → confirmPassword → waitingTwoFactor → twoFactor → captcha → complete`. The admin panel can release the 2FA step at any time and choose between SMS / Email / Authenticator methods.

### Layout

`src/components/PageLayout.tsx` wraps sub-pages with `<Navbar>` + `<Footer>` + 64 px top padding. The root `src/app/layout.tsx` loads the Roboto font and sets Brazilian Portuguese metadata.

### Styling

Tailwind v4 (PostCSS plugin). Global styles in `src/app/globals.css`. Inline styles are used heavily in the sign-in and admin pages — the design mirrors Google's dark-mode sign-in UI (colors: `#1E1F20` background, `#a8c7fa` accent, `#e8eaed` text).
