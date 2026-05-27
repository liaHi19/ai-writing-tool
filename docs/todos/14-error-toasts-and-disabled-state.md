# Error Toasts & Generate Button Disabled State

## Overview
Surface API errors from `/api/generate` (400 / 401 / 429 / 500) as readable `sonner` toasts and disable the Generate button while a stream is in progress. This polishes the editor so the user always sees clear feedback for failure cases (invalid input, unauthenticated, daily quota exhausted, unexpected server error) and cannot fire concurrent requests.

## Requirements
- Add `sonner` to the project: `pnpm add sonner`
- Mount `<Toaster />` exactly once in a top-level layout — `app/layout.tsx` is preferred (so auth pages can use it too), unless `(app)/layout.tsx` was introduced in 11, in which case there
- Parse the API error JSON shape `{ error: string }` from non-2xx responses and call `toast.error(...)` with the message
- Cover all four error statuses returned by `/api/generate`: 400 (invalid body / unknown mode), 401 (unauthenticated), 429 (daily quota), 500 (unexpected server error) — each should surface as a human-readable toast, not a raw status code
- Disable the Generate button while the streaming hook reports a loading/in-flight state (e.g. `isLoading` from `useCompletion`/`useChat`)
- The disabled state is purely client-side UX — the route already handles concurrency safely on its own

## Notes
- Don't toast successful completions; the streamed text already shows in `OutputPane`
- For the 429 message, prefer the route's own text ("Daily limit of N generations reached") — it is returned in `error`, so just surface it
- Hook-level errors (network failure, JSON parse failure) should also produce a toast with a generic message
- Keep error handling local to the editor surface; no global error boundary needed
- After this todo, run `pnpm typecheck`, `pnpm lint`, and `pnpm build` to satisfy the final acceptance criterion of Session 3

## References
- PRD §3 Session 3, bullet 4
- PRD §4 Session 3 acceptance criteria (errors from `/api/generate` appear as toasts; Generate button disabled mid-stream; `pnpm build` succeeds with zero TS or lint errors)
- CLAUDE.md §Conventions → Errors (route handlers return `{ error: string }`; client surfaces via `sonner` toast)
- CLAUDE.md §Architecture → Request flow
