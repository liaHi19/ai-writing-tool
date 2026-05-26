# Create Supabase Project & Populate .env.local

## Overview
Provision the Supabase project that backs auth and the Postgres database, then wire its credentials into the local environment. Nothing in the app can connect to auth or the DB until this is done.

## Requirements
- Create a new Supabase project (cloud or local via `supabase start`)
- Populate `.env.local` with all four required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
- Confirm `.env.local` is listed in `.gitignore` and is never committed
- Verify the app can boot (`pnpm dev`) with the env vars present and no missing-env errors

## Notes
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are server-only — they must never appear in any file imported by client components
- For local development, `supabase start` provides the URL and keys; for cloud, copy them from the project dashboard → Settings → API

## References
- PRD §3 Session 1, bullet 2
- CLAUDE.md §Rules (never expose service role key to client)
- CLAUDE.md §Commands → Required env
