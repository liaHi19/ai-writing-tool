# History Bento Card Grid

## Overview
Restructure `components/history/HistoryList.tsx` from today's vertical `<ul>` rows into an `auto-fill minmax(320px, 1fr)` bento card grid. Each card shows mode badge with accent dot, absolute date + relative time stacked top-right, the full output body clamped to 7 lines, a foot with char/word counts + Copy button, and a hover-revealed trash icon top-right wired to `deleteGeneration(id)` (todo `24-`).

## Requirements
- Update `components/history/HistoryList.tsx` — keep the existing server-component shell, `"use cache"`, `cacheTag`, `cacheLife` discipline; only the JSX changes
- Outer container: `grid gap-4` with `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))` (use a Tailwind `[grid-template-columns:...]` arbitrary value or a one-off utility)
- Create `components/history/HistoryCard.tsx` (client component for the hover trash + delete confirmation):
  - **Top-left:** mode badge — a small accent dot (`var(--accent)`, 8 px circle) followed by the mode name (Geist Sans)
  - **Top-right (stacked):** absolute date (Geist Mono, `var(--fg)`, e.g. "May 28 2026") on top, relative time (Geist Mono, `var(--fg-dim)`, e.g. "2 h ago") below. Use `Intl.DateTimeFormat` for absolute and a tiny `formatRelative` helper for relative (or pull from `date-fns` if it's already a dep — otherwise inline; don't add a dep for this)
  - **Body:** full `output` text rendered with `display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden`. Wrap in a div with these CSS properties — Tailwind has `line-clamp-7` utility
  - **Foot:** mono `<chars> · <words>` on the left, Copy button on the right (reuse `components/editor/CopyButton.tsx`)
  - **Hover-revealed trash icon:** top-right corner, only visible on `group-hover` (mark the card root `group`). On click → confirm dialog → call `deleteGeneration(id)` from todo `24-` → on `{ ok }`, the cache invalidation drops the card automatically; on `{ error }`, fire `toast.error`
- **Empty state:** match the cool-fog ground — centered card or pane with "No generations yet" + a link back to `/`. Replaces the current empty-state markup
- Use the generated `Tables<"generations">` type from `lib/db/types.ts` — never hand-write the row type
- Sort: newest first (already the case in the fetcher; verify the `order("created_at", { ascending: false })` clause is intact)

## Notes
- The trash button is the only client-side bit per card; keep the card root as a small client component and let the surrounding grid stay on the server. Alternatively, lift just the trash-on-hover into its own `<DeleteButton />` client component and keep the card a server component — either is fine
- For the `confirm` step, `window.confirm()` is acceptable for v1 (the toolbar's clear-all uses a richer dialog — see todo `26-`). If a shadcn `<AlertDialog />` is already installed, use it for consistency
- Cache invalidation is automatic — after `deleteGeneration` revalidates the tag, the next render skips the deleted row. No client state for the optimistic remove
- Search and filter logic lives in the **toolbar** (todo `26-`); this todo only renders the grid for whatever subset of generations is passed in
- The Header's entry-count pill (todo `19-`) reads the same cached list — the count updates on the next render after a delete

## References
- PRD §3 Session 5 → "History (`/history`) — bento card grid" subsection
- PRD §4 Session 5 → "`/history` shows bento cards with mode badge (accent dot), absolute date + relative time, full output (clamped to 7 lines), foot meta + Copy button, hover-reveal trash icon top-right"
- PRD §4 Session 5 → "Per-card trash → row deleted via `deleteGeneration(id)` server action"
- `AI Writing Tool.html` (see todo `17-`) → history-card markup for proportions, badge geometry, and date-stack typography
- CLAUDE.md §Next.js 16 → Cache layer (`"use cache"` discipline already in place for the fetcher)
- CLAUDE.md §Conventions → Types ("never hand-write" row types)
