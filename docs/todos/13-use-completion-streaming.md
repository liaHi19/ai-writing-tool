# Client Streaming via useCompletion

## Overview
Wire the editor UI to `POST /api/generate` so tokens stream live into `OutputPane`. The PRD specifies `useCompletion` from the Vercel AI SDK as the client hook; this todo covers sending the input text + selected mode and observing the in-flight `completion` value as it grows.

## Requirements
- Use `useCompletion` from `@ai-sdk/react` (AI SDK v6) inside the editor client surface (a parent client component, or directly in one of the editor components — implementer's choice)
- POST body: `{ text, mode }` where `mode` is a value from the `Mode` union in `lib/prompts.ts`
- Endpoint: `/api/generate` (already implemented in `app/api/generate/route.ts`)
- Bind the hook's streaming text value into `OutputPane` so tokens render live as they arrive
- The submit handler is wired to the Generate button; it sends the current `InputArea` value and `ModeSelector` value
- All 6 modes must work end-to-end with visible streaming

## Notes
- **AI SDK v6 caveat**: the route returns `result.toUIMessageStreamResponse()` (v6 method). Confirm `useCompletion` from `@ai-sdk/react` reads that response shape. If it does not, switch to `useChat` (or the appropriate v6 hook) and adapt the body wiring accordingly — the PRD's intent ("tokens render live into `OutputPane`") is what matters, not the exact hook name
- Pass `mode` via the hook's `body` option (or equivalent) so it reaches the route alongside `text`
- Don't introduce a server action here; the `/api/generate` route handler is the only path
- No streaming-cancel UI in v1 — the request runs to completion (PRD §2)

## References
- PRD §3 Session 3, bullet 3
- PRD §4 Session 3 acceptance criteria (user can paste text, pick any of the 6 modes, click Generate, see tokens stream)
- CLAUDE.md §Architecture → Request flow (`useCompletion` against `/api/generate`)
- CLAUDE.md §Stack (AI SDK v6: `ai` + `@ai-sdk/anthropic`, streamed with `streamText`)
