# Current Feature

## Todo
—

## Status
All planned features complete.

## What Was Built (Session 4)

### Server Actions for Auth
- **`actions/auth.ts`** — `signIn`, `signUp`, `signOut` as `"use server"` actions
- **`app/(auth)/login/login-form.tsx`** — refactored from `useState` + Supabase browser client to `useActionState` + server action; no more controlled inputs
- **`app/(auth)/signup/signup-form.tsx`** — same refactor; `emailSent` state now comes from action return value
- **`components/auth/SignOutButton.tsx`** — `<form action={signOut}>` wrapping a shadcn Button; replaces the old client-side `supabase.auth.signOut()` call
- **`lib/supabase/client.ts`** — deleted; browser Supabase client no longer needed (all auth goes through server actions)

### History Page
- **`lib/supabase/server-admin.ts`** — service-role client (no cookies), safe to call inside `"use cache"` boundaries
- **`app/(app)/layout.tsx`** — shared nav header for the `(app)` route group: Editor / History links, user email, `<SignOutButton>`
- **`app/(app)/history/page.tsx`** — Server Component; auth check outside cache boundary; `fetchHistory(userId)` marked `"use cache"` + `cacheTag` + `cacheLife("hours")`; card list with mode badge, timestamp, truncated input/output; empty state with link to editor

### Bug Fixes
- **`proxy.ts`** — `isAppRoute` now correctly matches `"/"` and `/history` (was incorrectly matching `/app*`)
- **`next.config.ts`** — added `cacheComponents: true` to enable `"use cache"` / `cacheTag` / `cacheLife`

## History

- Session 1 — Project setup: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui; Supabase project + `.env.local`; `@supabase/ssr` clients; root `proxy.ts` (session refresh + auth redirects); login + signup pages
- Session 2 — DB schema (`generations`, `usage_daily`, RLS policies); migration via `supabase db push`; generated `lib/db/types.ts`; `lib/anthropic.ts`, `lib/prompts.ts` (5 modes), `lib/rate-limit.ts`; `/api/generate` streaming route with auth, rate-limit, persist in `onFinish`, `revalidateTag`
- Session 3 — Editor UI: `InputArea`, `ModeSelector`, `OutputPane`, `CopyButton` components; `EditorPanel` with `useCompletion`; `app/(app)/page.tsx`; `sonner` toasts
- Session 4 — Server Actions auth refactor; History page with `"use cache"`; proxy + config fixes (see above)
