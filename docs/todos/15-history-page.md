# History Page & Final Pass

## Overview
Implement `app/(app)/history/page.tsx` — a Server Component that lists the signed-in user's past generations newest-first, backed by a cached fetcher keyed on `userId` and invalidated from `/api/generate`'s `onFinish`. Closes the loop on the editor → persist → display cycle, and finishes Session 4 with a clean lint / typecheck / build pass plus a manual smoke through all 5 modes.

## Requirements
- Create `app/(app)/history/page.tsx` as a Server Component
- Implement a cached fetcher (local `async function` or `lib/`-level helper) that:
  - is marked `"use cache"`
  - calls `cacheTag(\`history:${userId}\`)` and `cacheLife("hours")`
  - takes `userId` as an explicit argument — never reads `cookies()` / `headers()` / `auth` inside
- Query `generations` for the given `userId` ordered by `created_at desc`
- Render each row with: mode badge, timestamp, output preview (truncated), copy button
- Render an empty state when the user has no generations
- Wrap the auth-dependent portion in `<Suspense>` so the static shell can prerender under `cacheComponents`
- Rely on root `proxy.ts` for the signed-out redirect — do not re-gate in the page
- Final pass: run `pnpm lint`, `pnpm typecheck`, `pnpm build` — all must pass with zero errors
- Manual smoke: sign in, run all 5 modes (`improve`, `email`, `linkedin`, `technical`, `casual`), confirm each row appears on `/history`; sign out and confirm `/history` redirects to `/login`

## Notes
- The cached fetcher must take `userId` as a parameter so the cache key is explicit — this is a hard CLAUDE.md rule (no `cookies()`/`auth` inside `"use cache"`)
- Invalidation is handled by `revalidateTag(\`history:${userId}\`)` in `/api/generate`'s `onFinish` (todo 10) — do not call `revalidate*` from the history page
- Use the generated `Tables<"generations">` type from `lib/db/types.ts`; don't hand-write row types
- The row's copy button copies that row's `output`; reuse the clipboard pattern from `components/editor/CopyButton.tsx` rather than duplicating it
- RLS already scopes `select` on `generations` to `auth.uid()`, so user A cannot see user B's rows even if the cache key were wrong; the explicit `userId` argument is the defense-in-depth

## References
- PRD §3 Session 4
- PRD §4 Session 4 acceptance criteria (`/history` lists the signed-in user's generations newest-first; user A never sees user B's rows; manual smoke confirms all 5 modes return non-empty, on-topic output and are persisted to history)
- CLAUDE.md §Architecture → `(app)/history/page.tsx`
- CLAUDE.md §Next.js 16 → Cache layer (`"use cache"` + `cacheTag` + `cacheLife`; no `cookies()` inside)
- CLAUDE.md §Rules (cache-key inputs must be explicit arguments; invalidate via `revalidateTag`)
