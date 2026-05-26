# Current Feature

## Status

Not started — Session 2, task 2 of 4.

## Goals

TBD — next task in Session 2.

## Notes

## History

- Project setup and boilerplate cleanup
- Bootstrapped Next.js 16.2.6 with App Router, TypeScript strict mode, Tailwind CSS v4, shadcn/ui; build, lint, and typecheck all pass
- Provisioned Supabase project; populated `.env.local`; confirmed gitignored
- Installed `@supabase/ssr`; created `lib/supabase/server.ts`, `client.ts`, `proxy.ts`; typecheck passes
- Created root `proxy.ts` (Next 16 edge proxy): session refresh via `lib/supabase/proxy.ts`, redirects unauthenticated users to `/login`, redirects authenticated users away from `/login`/`/signup` to `/`; refactored `updateSession` to return `{ response, user }` eliminating duplicate client/getUser call
- Created `app/(auth)/login/page.tsx` + `login-form.tsx` and `app/(auth)/signup/page.tsx` + `signup-form.tsx`; added shadcn `Input` and `Label`; signup shows "check your email" when email confirmation is required; inline error display on auth failures; typecheck passes
- Authored `lib/db/schema.sql` with `generations` and `usage_daily` tables, composite PK `(user_id, day)` on `usage_daily`, index on `generations(user_id, created_at desc)`, RLS enabled, and per-table `select`/`insert`/`update` policies scoped by `auth.uid()`
- Installed `supabase` CLI as a pnpm devDependency (v2.101.0); ran `supabase init` (scaffolded `supabase/config.toml`) and mirrored schema into `supabase/migrations/20260526000000_init_schema.sql` for `supabase db push`
- Linked to hosted project `yujdftphgdymerltgruo`; applied migration via `supabase db push`; generated `lib/db/types.ts` via `supabase gen types typescript --linked` (contains `generations` and `usage_daily` Row/Insert/Update types)
- Installed `ai`, `@ai-sdk/anthropic`, and `server-only`; created `lib/anthropic.ts` exporting `MODEL_ID = "claude-sonnet-4-6"` and a configured `anthropic` provider, guarded by `import "server-only"` so it cannot leak into client bundles; typecheck passes
