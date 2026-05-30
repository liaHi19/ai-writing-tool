# Polish — AI Writing Tool

Paste text, pick a mode, get a streamed AI rewrite. Built with Next.js 16, Supabase, and the Anthropic API.

## Features

- **5 writing modes** — Improve, Email, LinkedIn, Technical, Casual
- **Streaming output** — responses stream token-by-token via Vercel AI SDK
- **Auth** — email/password sign-up and login via Supabase Auth
- **History** — per-user generation history with search and mode filtering
- **Rate limiting** — per-user daily quota enforced server-side
- **Responsive** — mobile-first layout, works from 375 px up

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI | Anthropic `claude-sonnet-4-6` via Vercel AI SDK (`streamText`) |
| Auth & DB | Supabase (Postgres + Auth + RLS) |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Package manager | pnpm |

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create `.env.local` at the project root:

```env
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Start Supabase locally

```bash
supabase start
supabase db reset   # applies migrations + seed
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (auth)/login, /signup     Auth pages
  page.tsx                  Main editor
  history/page.tsx          Generation history
  api/generate/route.ts     Streaming POST endpoint
components/
  ui/                       shadcn primitives only
  editor/                   InputArea, ModeSelector, OutputPane, CopyButton
  history/                  HistoryCard, HistoryList, HistoryToolbar
  shared/                   ConfirmDialog, Icon
lib/
  anthropic.ts              Vercel AI SDK client + model constant
  prompts.ts                System prompt per mode
  rate-limit.ts             Per-user daily quota check
  supabase/                 SSR-aware Supabase clients
  db/schema.sql             DB schema + RLS policies
actions/                    Server Actions (auth, history mutations)
hooks/                      useDebounce, useGenerate
proxy.ts                    Session refresh on every request (Next 16)
```

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit

# Supabase
supabase start
supabase db reset
supabase gen types typescript --local > lib/db/types.ts
```

## Architecture Notes

- **Request flow:** client POSTs to `/api/generate` → proxy refreshes Supabase session → route handler authenticates user, checks rate limit, selects system prompt by mode, calls `streamText`, persists output on stream finish via `onFinish`, returns a text stream response consumed by `useCompletion`.
- **Caching:** history list is cached with `"use cache"` + `cacheTag` and invalidated via `revalidateTag` after each new generation.
- **Proxy:** `proxy.ts` (not `middleware.ts`) handles session refresh on every request at the Edge — no DB or AI calls inside it.
- **RLS:** every user-owned table has row-level security scoped to `auth.uid()`.
