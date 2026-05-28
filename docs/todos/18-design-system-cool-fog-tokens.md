# Design System — Cool-Fog Tokens

## Overview
Replace the default OKLch tokens currently in `app/globals.css` with the fixed cool-fog palette specified by the PRD. This is the foundation every other Session 5 todo builds on: header, editor cards, history cards, and auth pages all read these CSS variables. No theme switcher and no `dark:` variants — Polish ships a single, baked-in look.

## Requirements
- Edit `app/globals.css` (and `tailwind.config.*` if the project gains one) to set the following tokens:
  - `--bg: #eef1f4`
  - `--surface: #f8fafc`
  - `--surface-2: #e6ebf1`
  - `--border: #d4dbe3`
  - `--fg: #161a1f`
  - `--fg-muted: #6b7280`
  - `--fg-dim: #9aa2ad`
  - `--accent: #2563eb`
  - `--accent-fg: #f8fafc`
- Set `--radius: 17px` and `--radius-sm: 9px` — replace the existing `0.625rem` value
- Remap the shadcn tokens (`--background`, `--foreground`, `--primary`, `--border`, `--muted-foreground`, etc.) onto the new cool-fog variables so the existing `components/ui/*` primitives pick up the palette without per-component changes
- Body background defaults to `var(--bg)`; cards/panels use `var(--surface)`; subtle insets use `var(--surface-2)`
- Mono font usage: reserve `font-family: var(--font-geist-mono)` for **labels, counters, timestamps, stat values** only. Add a Tailwind utility (e.g. `.font-mono` already maps via the existing `--font-geist-mono` setup) and document the rule with one short comment at the top of `globals.css`
- Delete the `dark` color-scheme block — no theme switcher in v1
- Bento grids: prefer Tailwind grid utilities (`grid-cols-12 gap-4`) over custom CSS where possible; the editor uses a 12-col grid (todo `20-`), history uses `auto-fill minmax(320px,1fr)` (todo `25-`)
- Final check: `pnpm build` passes; the existing editor + history pages render with the new palette before any per-card restyling lands (sanity check that nothing is hardcoding old colors)

## Notes
- Geist Sans and Geist Mono are already wired in `app/layout.tsx` as `--font-geist-sans` and `--font-geist-mono` — do not re-import them
- shadcn's tokens are HSL-style by convention; the cool-fog palette is hex. Use the hex values directly in `:root` and let shadcn's CSS variables consume them — no need to convert to HSL
- The accent (`#2563eb`) doubles as focus-ring color and as the "active mode" fill in the Mode card (todo `20-`); keep it as a single source-of-truth variable
- Touching `globals.css` is enough — do **not** rewrite `tailwind.config.ts`. Tailwind v4 reads CSS variables directly via `@theme inline`

## References
- PRD §3 Session 5 → "Visual system (fixed, no theme switcher)" subsection
- PRD §3 Session 5 → "Out of scope: the design's Tweaks panel … Defaults from `TWEAK_DEFAULTS` are baked in"
- `AI Writing Tool.html` (see todo `17-`) → `TWEAK_DEFAULTS` block for the source values
- CLAUDE.md §Stack → "Styling: Tailwind CSS + shadcn/ui"
