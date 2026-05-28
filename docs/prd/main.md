# AI Writing Tool — PRD

## 1. What we do

A Next.js 16 web app where a signed-in user pastes text, picks one of 6 modes, and receives a streamed AI response.

- **Modes (fixed set of 5):** `improve`, `email`, `linkedin`, `technical`, `casual`. One system prompt per mode in `lib/prompts.ts`.
- **Model:** Anthropic `claude-sonnet-4-6` via Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), streamed with `streamText`. Model id pinned in `lib/anthropic.ts`.
- **Auth:** Supabase email/password via `@supabase/ssr`. Session refresh handled in Next 16 `proxy.ts`.
- **Persistence:** Postgres tables `generations` (history) and `usage_daily` (per-user daily counter). RLS enabled, all policies scoped by `auth.uid()`.
- **Rate limiting:** Hardcoded daily quota per user, checked in `lib/rate-limit.ts` before every model call.
- **UI:** shadcn/ui + Tailwind. Editor screen (input + mode selector + streamed output + copy button) and a history screen listing the signed-in user's past generations.

## 2. What we don't do (scope boundary)

- No team workspaces, sharing, collaboration, or public links.
- No payments, plans, or billing UI. The daily quota is hardcoded.
- No file uploads, image input, PDF parsing, attachments — text in, text out only.
- No user-defined modes or prompt customization; the 5 modes are fixed.
- No model selection in the UI.
- No analytics, A/B testing, or admin dashboard.
- No mobile app, no offline mode, no PWA.
- No UI localization.
- No email/notifications beyond Supabase auth defaults; no custom password-reset flow.
- No streaming-cancel UI in v1 (request just runs to completion).

## 3. Decomposition into 5 sessions

### Session 1 — Foundation & Auth

- Bootstrap Next 16 + TypeScript + Tailwind + shadcn/ui.
- Create Supabase project; populate `.env.local`.
- `lib/supabase/{server,client,proxy}.ts` SSR-aware clients.
- Root `proxy.ts` (not `middleware.ts`) — session refresh + redirect signed-out users away from `(app)`.
- `(auth)/login` and `(auth)/signup` pages.
- `lib/db/schema.sql`: `generations`, `usage_daily`, RLS policies. Generate types via `supabase gen types`.

### Session 2 — Generate API & Streaming

- `lib/anthropic.ts` exporting the pinned model id and SDK client.
- `lib/prompts.ts` exporting `Mode` union and `PROMPTS: Record<Mode, string>` for all 5 modes.
- `lib/rate-limit.ts` reading/incrementing `usage_daily`.
- `app/api/generate/route.ts`: authenticate → validate `mode` against enum → check rate limit → `streamText` → on `onFinish` insert row into `generations`, increment `usage_daily`, call `revalidateTag(\`history:${userId}\`)`. Returns `result.toDataStreamResponse()`. Never buffers.

### Session 3 — Editor UI

- `(app)/page.tsx` main editor screen.
- `components/editor/{InputArea,ModeSelector,OutputPane,CopyButton}.tsx`.
- Client uses `useCompletion` against `/api/generate`; tokens render live into `OutputPane`.
- Errors surface as `sonner` toasts; Generate button disabled mid-stream.

### Session 4 — History & Polish

- `(app)/history/page.tsx` server component.
- Cached fetcher: `"use cache"` + `cacheTag(\`history:${userId}\`)`+`cacheLife("hours")`; `userId`passed as explicit argument (no`cookies()`/`auth` inside).
- Row UI: mode badge, timestamp, output preview, copy button. Empty state.
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build`. Manual smoke through all 5 modes + signed-out redirect.

### Session 5 — Design pass & history mutations

Source design: `AI Writing Tool.html` (Polish prototype, exported from claude.ai/design).

**Visual system (fixed, no theme switcher):**

- Cool-fog palette — `bg:#eef1f4`, `surface:#f8fafc`, `surface-2:#e6ebf1`, `border:#d4dbe3`, `fg:#161a1f`, `fg-muted:#6b7280`, `fg-dim:#9aa2ad`.
- Accent `#2563eb` (accent-fg `#f8fafc`).
- Corner radius `17px` (small `9px`).
- Geist (sans) + Geist Mono — already wired in `app/layout.tsx`. Mono is reserved for labels, counters, timestamps, and stat values.
- Bento 12-col grid wrapping the editor and a `auto-fill minmax(320px,1fr)` grid for history.

**Editor (`/`) — rebuild as bento:**

- Header: brand mark "P" + "Polish · writing v0.4" on the left, segmented Write/History tab nav in the middle (with entry-count pill on History), user email + sign-out on the right. Active tab driven by `usePathname()`.
- Mode card (span 7): 5 bento buttons, each showing `0N` index + name + one-line description. Active state = dark fill, accent dot.
- Stats card (span 5): words / chars / read time, live-updating via `useWatch` on the RHF `text` field.
- Draft card (span 12): minimal textarea (no inner border), counter bar + `<chars> / 2,400`, "⌘+Enter to rewrite" hint, Clear ghost button + primary "Rewrite as <Mode>" CTA. Counter turns accent past ~88% fill.
- Output card (span 12): empty-state pulse dot + label, Copy and Save buttons in the head, foot meta `<chars> · <words>` + mode name.
- ⌘/Ctrl + Enter shortcut bound at the panel level triggers Rewrite when input ≥ 10 chars.
- New `text` cap: `max(2400)` added to `lib/validation/generate.ts` (matches client clamp).

**History (`/history`) — bento card grid:**

- Toolbar: search input, filter chips (All + 5 modes, each with count), Clear-all action.
- Card: mode badge (accent dot + name), absolute date + relative time stacked top-right, full output body (`-webkit-line-clamp:7`), foot with char/word count + Copy button, hover-revealed trash icon top-right for per-row delete.
- Search + filtering are client-side over the cached server-fetched list.

**New server actions (`actions/generations.ts`):**

- `deleteGeneration(id)` — authenticates, deletes scoped by `user_id` (defence-in-depth on top of RLS), calls `revalidateTag(\`history:${user.id}\`)`.
- `clearAllGenerations()` — same auth + revalidation; returns deleted count for toast.

**Auth pages restyle:**

- `/login` and `/signup` adopt the cool-fog ground and Geist typography, with a single bento card (17 px radius) wrapping the form. Brand mark + "Polish" wordmark above the card. Server actions and Zod validation unchanged.

**Bug fix:** `app/api/generate/route.ts` calls `revalidateTag(\`history:${userId}\`, "hours")` with an unsupported second argument — drop it.

**Out of scope:** the design's Tweaks panel (live theme customizer). Defaults from `TWEAK_DEFAULTS` are baked in (`cool` / `#2563eb` / `17px` / Geist).

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
- Manual smoke confirms all 5 modes return non-empty, on-topic output and are persisted to history.

### Session 5

- `/` renders the bento layout on the cool-fog ground: mode card (5 buttons), stats card, draft card with counter bar, output card with empty-state pulse.
- Active mode button has the dark fill + accent dot treatment; clicking another mode updates the RHF `mode` field and the primary CTA label.
- Stats card updates words/chars/read-time live as the user types.
- Input is capped at 2,400 chars (client clamp + Zod `.max(2400)`); counter goes accent past ~88% fill; Rewrite button is disabled below 10 chars.
- ⌘/Ctrl + Enter from anywhere on the page triggers Rewrite when valid.
- Output card's **Save** action downloads a `.txt` file named `polish-<mode>-<timestamp>.txt`; **Copy** confirms via toast.
- Header shows brand mark + Polish wordmark, segmented Write/History nav (active driven by `usePathname()`, entry-count pill on History), user email + sign-out on the right.
- `/history` shows bento cards with mode badge (accent dot), absolute date + relative time, full output (clamped to 7 lines), foot meta + Copy button, hover-reveal trash icon top-right.
- Search input + filter chips narrow the visible cards client-side; chip counts reflect unfiltered totals.
- Per-card trash → row deleted via `deleteGeneration(id)` server action; `revalidateTag(\`history:${user.id}\`)` invalidates the cache and the card disappears.
- Clear-all → confirm dialog → `clearAllGenerations()` removes all rows for the user; empty state appears; entry-count pill on the Header tab decrements/disappears accordingly.
- A second user cannot delete another user's row by passing their `id` (RLS + `.eq("user_id", …)` clause both enforce this).
- `/login` and `/signup` render with the Polish bento card on cool-fog bg; Zod errors still surface inline; sign-in/sign-up flows unchanged.
- `app/api/generate/route.ts` no longer passes a second argument to `revalidateTag`.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` all return zero errors.
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` remain absent from any client bundle after the restyle.
