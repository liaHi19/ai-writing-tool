# Root proxy.ts — Session Refresh & Signed-Out Redirect

## Overview
Implement the Next.js 16 edge proxy that runs on every matched request. It refreshes the Supabase session cookie and redirects unauthenticated users away from protected `(app)` routes to `/login`.

## Requirements
- Create `proxy.ts` at the project root (not `middleware.ts`)
- Export a `proxy` function (not `middleware`) and a `config` object with a `matcher`
- Call `lib/supabase/proxy.ts` to refresh the session on every request
- Redirect any unauthenticated request targeting an `(app)` route to `/login`
- Redirect authenticated users away from `/login` and `/signup` to `/`
- `middleware.ts` must not exist in the project

## Notes
- Next 16 accepts `middleware.ts` but logs a deprecation warning — use `proxy.ts` exclusively
- Keep this file lean: session refresh and redirects only. No DB queries, no Anthropic calls
- The matcher should exclude static assets (`/_next/`, `/favicon.ico`, etc.) to avoid unnecessary edge invocations

## References
- PRD §3 Session 1, bullet 4
- PRD §4 Session 1 acceptance criteria (proxy.ts export + config.matcher; middleware.ts must not exist)
- CLAUDE.md §Next.js 16 → Proxy (formerly Middleware)
- CLAUDE.md §Rules (proxy.ts only, session refresh only)
