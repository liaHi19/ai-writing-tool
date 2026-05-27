# (app) Editor Page

## Overview
Compose the editor screen at `app/(app)/page.tsx`. This is the route a signed-in user lands on; it hosts the "paste text, pick a mode, see streamed output" loop described in the PRD by composing the four `components/editor/*` client components.

## Requirements
- Create the `(app)` route group; add `app/(app)/page.tsx` rendering the editor screen
- The page composes `InputArea`, `ModeSelector`, `OutputPane`, and `CopyButton` from `components/editor/`
- Page is a Server Component by default; only the editor components themselves carry `"use client"` (they own the streaming hook and DOM state)
- Rely on the existing root `proxy.ts` to redirect signed-out users away from `(app)`; do not duplicate that auth check in the page
- Lay out the screen with Tailwind: input + mode selector + Generate button on top, output pane below, copy button alongside the output

## Notes
- A `(app)/layout.tsx` is optional — only add one if shared UI for this route group is needed. The `sonner` `<Toaster />` is mounted elsewhere (see 14)
- Don't read `cookies()` / `auth` in this server component just to gate access — `proxy.ts` is the single auth gate
- The actual `useCompletion` wiring belongs to the client components (see 13), not this page

## References
- PRD §3 Session 3, bullet 1
- PRD §4 Session 3 acceptance criteria (user can paste text, pick mode, click Generate, see tokens stream)
- CLAUDE.md §Architecture → `(app)/page.tsx`
- CLAUDE.md §Conventions → Routing (Server Components by default; route groups `(auth)` and `(app)`)
- CLAUDE.md §Next.js 16 → Proxy (session refresh + redirects live there, not in pages)
