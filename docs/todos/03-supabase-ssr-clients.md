# Supabase SSR-Aware Clients

## Overview
Create the three Supabase client modules that the rest of the app imports. Each targets a different runtime context (server components, browser, edge proxy) so cookies are handled correctly in Next.js App Router.

## Requirements
- `lib/supabase/server.ts` — creates a server-side client using `@supabase/ssr` `createServerClient`; reads/writes cookies via Next.js `cookies()` 
- `lib/supabase/client.ts` — creates a browser-side client using `@supabase/ssr` `createBrowserClient`; safe to import in `"use client"` components
- `lib/supabase/proxy.ts` — creates a client suitable for the Edge proxy; used by root `proxy.ts` to refresh the session on every request
- No component or route handler calls `createClient` directly — all DB/auth access goes through one of these three modules

## Notes
- `@supabase/ssr` replaces the deprecated `@supabase/auth-helpers-nextjs`; use it exclusively
- The server client must forward cookie mutations back to the response (required for session refresh to persist)
- `lib/supabase/proxy.ts` differs from `server.ts` in that it receives `request`/`response` objects rather than using the Next `cookies()` API directly

## References
- PRD §3 Session 1, bullet 3
- CLAUDE.md §Architecture → `lib/supabase/`
- CLAUDE.md §Conventions → Data access
