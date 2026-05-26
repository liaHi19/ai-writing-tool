# Streaming Generate API Route

## Overview
Implement `app/api/generate/route.ts`: the streaming endpoint that ties together auth, mode validation, rate limiting, the Anthropic model call, and persistence. This is the only place where the model is invoked.

## Requirements
- Create `app/api/generate/route.ts` exporting a `POST` handler.
- Request body: `{ text: string, mode: Mode }`.
- Flow, in order:
  1. Authenticate via the SSR Supabase client (`lib/supabase/server.ts`). If no user → `401`.
  2. Validate `mode` against the `Mode` union from `lib/prompts.ts`. Unknown mode → `400`.
  3. Call `checkRateLimit(userId)` from `lib/rate-limit.ts`. Over quota → `429`.
  4. Call `streamText({ model: provider(MODEL_ID), system: PROMPTS[mode], prompt: text })` from `lib/anthropic.ts` + `lib/prompts.ts`.
  5. In `onFinish({ text: output })`:
     - Insert a row into `generations` with `user_id`, `mode`, `input` (original text), `output`, `model` (= `MODEL_ID`).
     - Call `incrementUsage(userId)`.
     - Call `revalidateTag(\`history:${userId}\`)` from `next/cache`.
  6. Return `result.toDataStreamResponse()`.
- The route must stream — never `await` the full completion before returning.
- Error responses use `{ error: string }` JSON with the appropriate status code.
- `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must not appear in any client bundle (verify via `pnpm build`).

## Notes
- Persist in `onFinish`, not client-side after the stream ends — the client may disconnect.
- No streaming-cancel UI in v1; the request runs to completion.
- Don't introduce new helpers here; reuse `lib/anthropic.ts`, `lib/prompts.ts`, `lib/rate-limit.ts`, and `lib/supabase/server.ts`.

## References
- PRD §3 Session 2, bullet 4
- PRD §4 Session 2 acceptance criteria (all bullets)
- CLAUDE.md §Architecture → Request flow
- CLAUDE.md §Rules (always stream; persist in `onFinish`; validate mode; never expose service-role/Anthropic keys)
- CLAUDE.md §Next.js 16 → Cache layer (`revalidateTag(\`history:${userId}\`)` in `onFinish`)
