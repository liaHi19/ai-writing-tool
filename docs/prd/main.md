# AI Writing Tool — PRD

## 1. What we do

A Next.js 16 web app where a signed-in user pastes text, picks one of 6 modes, and receives a streamed AI response.

- **Modes (fixed set of 6):** `improve`, `email`, `linkedin`, `technical`, `casual`, `translate`. One system prompt per mode in `lib/prompts.ts`.
- **Model:** Anthropic `claude-sonnet-4-6` via Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), streamed with `streamText`. Model id pinned in `lib/anthropic.ts`.
- **Auth:** Supabase email/password via `@supabase/ssr`. Session refresh handled in Next 16 `proxy.ts`.
- **Persistence:** Postgres tables `generations` (history) and `usage_daily` (per-user daily counter). RLS enabled, all policies scoped by `auth.uid()`.
- **Rate limiting:** Hardcoded daily quota per user, checked in `lib/rate-limit.ts` before every model call.
- **UI:** shadcn/ui + Tailwind. Editor screen (input + mode selector + streamed output + copy button) and a history screen listing the signed-in user's past generations.

## 2. What we don't do (scope boundary)

- No team workspaces, sharing, collaboration, or public links.
- No payments, plans, or billing UI. The daily quota is hardcoded.
- No file uploads, image input, PDF parsing, attachments — text in, text out only.
- No user-defined modes or prompt customization; the 6 modes are fixed.
- No model selection in the UI.
- No analytics, A/B testing, or admin dashboard.
- No mobile app, no offline mode, no PWA.
- No UI localization (note: `translate` is a feature, not app i18n).
- No email/notifications beyond Supabase auth defaults; no custom password-reset flow.
- No streaming-cancel UI in v1 (request just runs to completion).

## 3. Decomposition into 4 sessions

### Session 1 — Foundation & Auth
- Bootstrap Next 16 + TypeScript + Tailwind + shadcn/ui.
- Create Supabase project; populate `.env.local`.
- `lib/supabase/{server,client,proxy}.ts` SSR-aware clients.
- Root `proxy.ts` (not `middleware.ts`) — session refresh + redirect signed-out users away from `(app)`.
- `(auth)/login` and `(auth)/signup` pages.
- `lib/db/schema.sql`: `generations`, `usage_daily`, RLS policies. Generate types via `supabase gen types`.

### Session 2 — Generate API & Streaming
- `lib/anthropic.ts` exporting the pinned model id and SDK client.
- `lib/prompts.ts` exporting `Mode` union and `PROMPTS: Record<Mode, string>` for all 6 modes.
- `lib/rate-limit.ts` reading/incrementing `usage_daily`.
- `app/api/generate/route.ts`: authenticate → validate `mode` against enum → check rate limit → `streamText` → on `onFinish` insert row into `generations`, increment `usage_daily`, call `revalidateTag(\`history:${userId}\`)`. Returns `result.toDataStreamResponse()`. Never buffers.

### Session 3 — Editor UI
- `(app)/page.tsx` main editor screen.
- `components/editor/{InputArea,ModeSelector,OutputPane,CopyButton}.tsx`.
- Client uses `useCompletion` against `/api/generate`; tokens render live into `OutputPane`.
- Errors surface as `sonner` toasts; Generate button disabled mid-stream.

### Session 4 — History & Polish
- `(app)/history/page.tsx` server component.
- Cached fetcher: `"use cache"` + `cacheTag(\`history:${userId}\`)` + `cacheLife("hours")`; `userId` passed as explicit argument (no `cookies()`/`auth` inside).
- Row UI: mode badge, timestamp, output preview, copy button. Empty state.
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build`. Manual smoke through all 6 modes + signed-out redirect.

## 4. Acceptance criteria

### Session 1
- A new user can sign up, log in, and log out; session survives a full page reload.
- Visiting any `(app)` route while signed-out redirects to `/login`.
- `proxy.ts` exists with a `proxy` export and a `config.matcher`; `middleware.ts` does not exist.
- `supabase db reset` applies the schema cleanly.
- RLS verified: user A cannot `select` user B's rows in `generations` or `usage_daily`.

### Session 2
- `POST /api/generate` with `{ text, mode }` streams tokens for each of the 6 modes.
- Unknown `mode` → `400`. Unauthenticated → `401`. Over daily quota → `429`.
- After stream completes, a `generations` row exists for the user with `output` populated and the correct `mode`; `usage_daily.count` for today is incremented by exactly 1.
- `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` do not appear in any client bundle (verified via `pnpm build` output inspection).
- Response is streamed — the route never `await`s the full completion before returning.

### Session 3
- User can paste text, pick any of the 6 modes, click Generate, and see tokens stream in.
- Copy button copies the full output to the clipboard.
- Errors from `/api/generate` (400/401/429/500) appear as toasts with a readable message.
- Generate button is disabled while a stream is in progress.
- `pnpm build` succeeds with zero TS or lint errors.

### Session 4
- `/history` lists the signed-in user's generations newest-first; user A never sees user B's rows.
- After generating a new output, navigating to `/history` shows the new row (tag invalidated via `revalidateTag` in `onFinish`).
- History fetcher is annotated with `"use cache"` and takes `userId` as an explicit argument.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass green.
- Manual smoke confirms all 6 modes return non-empty, on-topic output and are persisted to history.