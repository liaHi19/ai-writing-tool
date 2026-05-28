# History Server Actions + revalidateTag Bug Fix

## Overview
Add the two server actions History needs for mutation — `deleteGeneration(id)` and `clearAllGenerations()` — in a new `actions/generations.ts`. Both authenticate, scope by `user_id` (defence-in-depth on top of RLS), and call `revalidateTag(\`history:${user.id}\`)` so the cached list and the header entry-count pill (todo `19-`) both invalidate. Also fixes the existing `app/api/generate/route.ts` bug where `revalidateTag` is called with an unsupported second argument (`"hours"`).

## Requirements
- Create `actions/generations.ts` with `"use server"` at the top, alongside the existing `actions/auth.ts`
- **`deleteGeneration(id: string)`:**
  - Call `getAuthenticatedUser()` (the helper introduced in the recent refactor) — return `{ error }` if unauthenticated
  - Call `supabase.from("generations").delete().eq("id", id).eq("user_id", user.id)` — the explicit `user_id` clause is defence-in-depth on top of the existing RLS policy
  - On success, `revalidateTag(\`history:${user.id}\`)` and return `{ ok: true }`
  - On Supabase error, return `{ error: error.message }`
- **`clearAllGenerations()`:**
  - Same auth + revalidation
  - Call `supabase.from("generations").delete().eq("user_id", user.id).select("id", { count: "exact", head: true })` (or equivalent) and return `{ ok: true, deleted: count ?? 0 }`
  - Used by the toolbar (todo `26-`) to show "Deleted N generations" in the toast
- Both actions return a plain serializable object; no throws (client-callable server actions cannot throw cleanly)
- **Bug fix — `app/api/generate/route.ts`:** locate the `revalidateTag(\`history:${userId}\`, "hours")` call inside `onFinish` and remove the `"hours"` second argument. The TS signature of `revalidateTag` is `(tag: string) => void` — the current call compiles only because of a loose type in scope, but at runtime the second arg is ignored. Leaves a single clean `revalidateTag(\`history:${userId}\`)` call

## Notes
- The 2nd `revalidateTag` arg looks like it was meant to mirror `cacheLife("hours")` from the fetcher side — but cache-lifetime profiles only apply at definition time, not invalidation time. Dropping the arg is the correct fix
- RLS on `generations` already scopes `select` / `insert` / `delete` to `auth.uid()`; the `.eq("user_id", user.id)` is belt-and-braces. Both must be present so a hypothetical RLS misconfiguration can't widen the blast radius
- Don't bundle the `id` validation into a separate Zod schema for a single string — `z.string().uuid().safeParse(id)` is overkill here; trust the type and let Supabase reject malformed UUIDs at the DB layer
- The `clearAllGenerations` action returns the deleted count so the toolbar (todo `26-`) can render a friendly confirmation toast; the cache invalidation makes the list disappear without a client-side re-fetch
- `getAuthenticatedUser` is the same helper used by `actions/auth.ts` and the cached history fetcher; reusing it keeps the identity flow consistent

## References
- PRD §3 Session 5 → "New server actions (`actions/generations.ts`)"
- PRD §3 Session 5 → "Bug fix: `app/api/generate/route.ts` calls `revalidateTag(...)` with an unsupported second argument — drop it"
- PRD §4 Session 5 → "Per-card trash → row deleted via `deleteGeneration(id)` server action; `revalidateTag(...)` invalidates the cache"
- PRD §4 Session 5 → "Clear-all → confirm dialog → `clearAllGenerations()` removes all rows for the user"
- PRD §4 Session 5 → "A second user cannot delete another user's row by passing their `id` (RLS + `.eq("user_id", …)` clause both enforce this)"
- PRD §4 Session 5 → "`app/api/generate/route.ts` no longer passes a second argument to `revalidateTag`"
- CLAUDE.md §Rules → "Every user-owned table must have RLS enabled with explicit policies scoped by `auth.uid()`"
- CLAUDE.md §Next.js 16 → Cache layer (invalidate via `revalidateTag` in mutation paths)
