# Responsive Layout — Mobile, Tablet, Desktop

## Overview

Make the whole app responsive across phone, tablet, and desktop. Today the layout is built for wide viewports — the editor bento grid (todo `20-`), the history bento card grid (todo `25-`), the header nav (todo `19-`), the history toolbar (todo `26-`), and the auth bento card (todo `27-`) all assume desktop width and break or overflow on narrow screens. This is a **CSS/Tailwind layout change only** — no server actions, data flow, validation, streaming, or component APIs change. Adopt a mobile-first breakpoint strategy using Tailwind's default `sm` (640px) / `md` (768px) / `lg` (1024px) / `xl` (1280px) breakpoints and the existing design tokens from todo `18-`.

## Requirements

- **Header (`components/.../Header.tsx`, `HeaderNav`, user chip — todo `19-`):**
  - On mobile, the Write/History segmented nav and the user chip must not overflow or wrap awkwardly. Collapse the user chip to avatar/initial only on `< sm`, show the full email/name from `sm` up
  - The brand mark + wordmark stays visible at every width; reduce its size on `< sm` if needed
  - Live mode label (`ModeProvider`, session 20) stays legible on mobile; truncate or hide on the narrowest widths rather than pushing the nav off-screen
- **Editor (`components/editor/EditorPanel.tsx` 12-col grid, `ModeCard` bento, `DraftCard`, `OutputCard`, `StatsCard` — todos `20`–`23`):**
  - The 12-col grid collapses to a single column on `< md`: mode cards, draft, stats, and output stack vertically in a sensible reading order (modes → draft → stats → output)
  - The 5 `ModeCard` bento buttons reflow to a 2-col (or scrollable single-row) layout on mobile instead of a fixed wide row; tap targets stay ≥ 44px
  - `DraftCard` textarea + progress strip + char cap + Clear/Rewrite CTAs remain usable; CTAs go full-width or stack on `< sm`
  - `StatsCard` (words/chars/read-time) wraps its stats rather than overflowing
  - `OutputCard` streamed output is readable on mobile; Copy + Save actions stay reachable (stack or wrap, don't clip)
  - The `⌘/Ctrl+Enter` shortcut still works; add no mobile-only submit affordance unless trivial
- **History (`HistoryView`, `HistoryToolbar`, history bento card grid — todos `25`, `26`):**
  - Card grid goes multi-column on desktop → 2-col on tablet → 1-col on mobile
  - `HistoryToolbar`: search input goes full-width on mobile; the 6 filter chips wrap to multiple rows (or scroll horizontally) without clipping their count badges; Clear-all stays reachable (don't let it fall off-screen)
  - History cards keep their Copy/Delete actions tappable at mobile widths
- **Auth pages (`/login`, `/signup` bento card — todo `27-`):**
  - The brand block + single bento card stay centered and fit within the viewport on mobile with comfortable side padding (no edge-to-edge or horizontal scroll); cap card width on desktop
- **Global:**
  - No horizontal scrollbar at any width from 320px up
  - Respect safe interior padding on small screens (page gutters scale down on mobile, not zero)
  - Use Tailwind responsive utilities + `cn()` (no inline `style=` except dynamic values, per CLAUDE.md)
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build` all return zero errors

## Notes

- **Scope is layout only.** Do not touch `actions/*`, `lib/validation/*`, the `/api/generate` streaming route, `useGenerate`/`useCompletion` wiring, RHF resolvers, or any server-side code. If a component needs a wrapper `div` or class change to reflow, that's fine; changing its props/behavior is not
- Mobile-first: write base (unprefixed) classes for the narrowest screen, then layer `sm:`/`md:`/`lg:` overrides — avoid desktop-first `max-*` where the default Tailwind config makes min-width cleaner
- Reuse the cool-fog design tokens (todo `18-`); don't introduce new colors or radii for mobile
- The bento aesthetic should survive on mobile — cards keep their `radius`, `border`, and `surface` treatment; only their arrangement (columns → stack) changes
- Test the real breakpoints in a browser/devtools at 320px, 375px, 768px, 1024px, and 1280px before calling it done; the `/run` or `gstack` responsive tooling can capture these widths
- Watch the `DraftCard` progress strip and `StatsCard` — fixed-width inner elements are the most likely overflow culprits

## References

- `docs/todos/19-app-header-restyle.md` → header nav + user chip that must collapse on mobile
- `docs/todos/20-editor-bento-shell-and-mode-card.md` → 12-col grid + 5 mode bento buttons to reflow
- `docs/todos/21-editor-stats-card.md`, `22-editor-draft-card.md`, `23-editor-output-card.md` → editor cards to stack
- `docs/todos/25-history-bento-card-grid.md` → card grid columns to scale down
- `docs/todos/26-history-toolbar-search-and-filters.md` → toolbar search/chips/clear-all to wrap
- `docs/todos/27-auth-pages-restyle.md` → auth bento card to fit mobile viewport
- `docs/todos/18-design-system-cool-fog-tokens.md` → design tokens to reuse (no new tokens for mobile)
- `AI Writing Tool.html` (see todo `17-`) → reference markup for spacing/geometry if it includes responsive hints
