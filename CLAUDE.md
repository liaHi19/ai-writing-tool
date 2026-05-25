# AI Writing Tool

A Next.js app where a user pastes text, picks a mode (improve / email / linkedin / technical / casual / translate), and receives a streamed AI response.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Anthropic `claude-sonnet-4-6` via Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), streamed with `streamText`
- **Backend:** Supabase (Postgres + Auth)
  - Auth: email/password (and/or OAuth) via `@supabase/ssr`
  - DB: history of generations, per-user usage counters
  - RLS enabled on every user-owned table
- **Runtime:** Node.js 20+, package manager `pnpm`

## Architecture

```
app/
  (auth)/login, /signup           Supabase Auth pages
  (app)/
    page.tsx                      Main editor: textarea + mode selector + streamed output
    history/page.tsx              List of past generations for the signed-in user
  api/
    generate/route.ts             POST { text, mode } -> streamed text response (Edge or Node runtime)
components/
  ui/                             shadcn primitives
  editor/                         InputArea, ModeSelector, OutputPane, CopyButton
lib/
  anthropic.ts                    Vercel AI SDK client + model id constant
  prompts.ts                      System prompt per mode (improve/email/linkedin/technical/casual/translate)
  supabase/
    server.ts, client.ts, proxy.ts   SSR-aware Supabase clients
  rate-limit.ts                   Per-user daily quota check against Postgres
  db/
    schema.sql                    generations, usage tables + RLS policies
proxy.ts                          (Next 16) Refresh Supabase session on every request — replaces middleware.ts
```

**Request flow:** client posts to `/api/generate` → proxy refreshes session → route handler authenticates user, checks rate limit, selects system prompt by mode, calls `streamText`, persists final output to `generations` on stream finish (`onFinish`), returns `result.toDataStreamResponse()`. Client consumes via `useCompletion`.

**DB tables:**

- `generations(id, user_id, mode, input, output, model, created_at)` — RLS: user can only read/insert their own rows.
- `usage_daily(user_id, day, count)` — incremented per successful generation; checked before calling the model.

## Next.js 16

### Proxy (formerly Middleware)

- The Edge middleware file is now `proxy.ts` at the project root. Do **not** create `middleware.ts` — Next 16 still accepts it but logs a deprecation warning.
- Export `proxy` (not `middleware`) and a `config` with a `matcher`.
- Keep `proxy.ts` lean: only session refresh + redirects. No DB queries, no Anthropic calls — it runs on every matched request on the Edge runtime.
- Supabase session refresh lives in `lib/supabase/proxy.ts` and is called from the root `proxy.ts`.

### Cache layer (`"use cache"`)

Next 16 ships an explicit, opt-in cache. We use it as follows:

- **Default is uncached.** Add `"use cache"` only to functions/components whose output is safe to share across users *or* is keyed on the user id.
- Cache the **history list** page data fetcher with `"use cache"` + `cacheTag(\`history:${userId}\`)` so we can invalidate precisely after a new generation is saved.
- Call `revalidateTag(\`history:${userId}\`)` inside the `onFinish` handler of `/api/generate` after inserting the new row.
- Use `cacheLife("hours")` (or a named profile) for the history fetcher; never cache the streaming generate route.
- **Never** wrap anything that reads `cookies()`, `headers()`, or `auth.uid()` directly inside a `"use cache"` function — pass the user id in as an argument so the cache key is explicit.
- Prompts in `lib/prompts.ts` are pure data — they don't need `"use cache"`.

## Commands

```bash
pnpm install
pnpm dev                  # next dev (http://localhost:3000)
pnpm build
pnpm start
pnpm lint
pnpm typecheck            # tsc --noEmit

# Supabase (local)
supabase start            # local stack
supabase db reset         # re-apply migrations + seed
supabase gen types typescript --local > lib/db/types.ts
```

Required env (`.env.local`):

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never imported in client components
```

## Rules

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` to the client. They live only in route handlers / server components.
- **Every** user-owned table must have RLS enabled with explicit `select`/`insert` policies scoped by `auth.uid()`.
- **Always** check the rate limit (`lib/rate-limit.ts`) before invoking the model in `/api/generate`.
- **Always** stream — never buffer the full Anthropic response before returning.
- Persist generations in `onFinish`, not after `await`-ing the stream client-side.
- Validate `mode` against an enum on the server; reject unknown modes with 400.
- Use the pinned model id `claude-sonnet-4-6` from `lib/anthropic.ts`; don't hardcode model strings elsewhere.
- No `any`. No `// @ts-ignore` without a comment explaining the constraint.
- Use `proxy.ts` (Next 16), never `middleware.ts`. Session refresh only; no data fetching in the proxy.
- Any function marked `"use cache"` must take all cache-key inputs (e.g. `userId`) as explicit arguments — never read `cookies()`/`headers()`/`auth` inside it. Invalidate via `revalidateTag` in mutation paths.

## Git

- Never include Claude as a co-author in commit messages.

## Conventions

- **Routing:** App Router with route groups `(auth)` and `(app)`. Server Components by default; add `"use client"` only when needed (forms, streaming hooks).
- **Data access:** All DB reads/writes go through `lib/supabase/server.ts` (server) or `lib/supabase/client.ts` (browser). No direct `createClient` calls in components.
- **Prompts:** One system prompt per mode in `lib/prompts.ts`, exported as `PROMPTS: Record<Mode, string>`. `Mode` is a string-literal union, single source of truth.
- **UI:** shadcn components installed via `pnpm dlx shadcn@latest add <name>` into `components/ui/`. Don't edit them ad-hoc; wrap them in `components/editor/*` for app-specific behavior.
- **Styling:** Tailwind utility classes; no inline `style=` except for dynamic values. Use `cn()` helper from `lib/utils.ts` for conditional classes.
- **Naming:** kebab-case files, PascalCase components, camelCase functions, SCREAMING_SNAKE for env constants.
- **Errors:** Route handlers return `{ error: string }` with appropriate status; client surfaces via toast (`sonner`).
- **Types:** Database row types come from `supabase gen types`; never hand-write them.
