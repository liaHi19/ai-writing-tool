# Editor Bento Shell + Mode Card

## Overview
Wrap the editor screen in a 12-col bento grid and build the first card — **Mode** (span 7). Replaces the current `<Select>`-based `components/editor/ModeSelector.tsx` with five tactile bento buttons, each showing a `0N` index, name, and a one-line description. Active state is dark fill + accent dot, and the click updates the RHF `mode` field that drives the rest of the editor (Draft CTA label, Output foot meta).

## Requirements
- Edit `app/(app)/page.tsx` (or `components/editor/EditorPanel.tsx`) to wrap the editor in a `grid grid-cols-12 gap-4` container — the bento shell
- Place the new Mode card in `col-span-7`; reserve `col-span-5` for the Stats card (todo `21-`), and `col-span-12` rows for Draft (todo `22-`) and Output (todo `23-`)
- Create `components/editor/ModeCard.tsx` (replaces `ModeSelector.tsx`):
  - Renders the five modes from `MODES` exported by `lib/prompts.ts` — do not re-derive
  - Each button shows: a mono `01`–`05` index (left), the mode name (Geist Sans, large), and a one-line description (Geist Sans, `var(--fg-muted)`)
  - Layout: 5-button bento (e.g. a 2-col responsive grid that wraps; the prototype HTML is authoritative for the exact arrangement)
  - **Active state:** `bg: var(--fg)`, `text: var(--accent-fg)`, plus an accent dot (`bg: var(--accent)`, 8 px circle) in the top-right corner
  - **Inactive state:** `bg: var(--surface)`, `text: var(--fg)`, hairline border `var(--border)`
  - Bound to the RHF `mode` field via `<FormField>` → `field.value` / `field.onChange` (same pattern as the existing editor — see session 8)
- Add the per-mode descriptions (one short sentence each) alongside `PROMPTS` in `lib/prompts.ts` — extend the const so descriptions and prompts stay together (e.g. `MODE_META: Record<Mode, { name: string; description: string }>`)
- Delete `components/editor/ModeSelector.tsx` once nothing imports it
- The Draft CTA label ("Rewrite as &lt;Mode&gt;") and Output foot meta both read this same `mode` field — no other plumbing needed

## Notes
- Keep `ModeCard` a small `"use client"` component; it owns no state, just renders buttons and forwards changes to the RHF field
- The bento shell stays on the server page; only the cards that own DOM events or hooks are `"use client"`
- Active style is applied via class composition with `cn()` from `lib/utils.ts` (existing helper) — no inline styles
- Mode names are already title-cased in `MODES` constant — capitalize for display via a small `.charAt(0).toUpperCase()` or store a separate display name in the new `MODE_META`. The Zod enum keeps using the lowercase `MODES` values, no schema change
- React Compiler still applies — for any derived value (e.g. active mode lookup), use `useWatch` not `form.watch()` (per session 8 note)

## References
- PRD §3 Session 5 → "Mode card (span 7): 5 bento buttons, each showing `0N` index + name + one-line description. Active state = dark fill, accent dot."
- PRD §3 Session 5 → "Bento 12-col grid wrapping the editor"
- PRD §4 Session 5 → "Active mode button has the dark fill + accent dot treatment; clicking another mode updates the RHF `mode` field and the primary CTA label"
- `AI Writing Tool.html` (see todo `17-`) → mode-card markup for arrangement, padding, and the index/name/description hierarchy
- CLAUDE.md §Conventions → Prompts ("`Mode` is a string-literal union, single source of truth")
