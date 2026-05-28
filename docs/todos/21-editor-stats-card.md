# Editor Stats Card

## Overview
Add the **Stats card** (span 5, sits next to the Mode card from todo `20-`) showing live word count, character count, and read time as the user types. Values update on every keystroke via `useWatch` against the RHF `text` field. All numbers render in Geist Mono per the design-system rule.

## Requirements
- Create `components/editor/StatsCard.tsx` as a `"use client"` component
- Inside the editor's RHF context, subscribe to the `text` field with `useWatch({ control: form.control, name: "text" })` — **not** `form.watch("text")` (React Compiler flags `watch()` as un-memoizable; see session 8 note)
- Compute three stats from the watched text:
  - **Words:** `text.trim().split(/\s+/).filter(Boolean).length`
  - **Chars:** `text.length`
  - **Read time:** `Math.max(1, Math.round(words / 220))` minutes (200–240 wpm is the standard range; round up for short text so 1 word is still "1 min")
- Render as a vertical stack (or 3-col grid — the prototype is authoritative) of stat rows:
  - Label (Geist Sans, `var(--fg-muted)`, small)
  - Value (Geist Mono, `var(--fg)`, large)
  - Optional unit suffix (`words`, `chars`, `min` — mono, dim)
- Card chrome: `bg: var(--surface)`, radius `var(--radius)`, hairline `var(--border)`, internal padding consistent with the Mode card
- Empty input → all three values show `0` (and `1` for read time per the floor above); never show `NaN` or hide the card
- Slot the card into the bento grid at `col-span-5`

## Notes
- The card is read-only; no inputs, no buttons, no callbacks
- Word-splitting on `/\s+/` collapses runs of whitespace correctly; the `.filter(Boolean)` handles the leading/trailing-whitespace edge case where `split` would yield an empty string
- 220 wpm is the average silent-reading speed for English non-fiction — a defensible default. If the prototype uses a different number, match it
- The component pulls the RHF `control` either through `useFormContext()` or as a prop — pick whichever pattern the existing editor components use (likely prop drilling from `EditorPanel`)

## References
- PRD §3 Session 5 → "Stats card (span 5): words / chars / read time, live-updating via `useWatch` on the RHF `text` field"
- PRD §4 Session 5 → "Stats card updates words/chars/read-time live as the user types"
- `AI Writing Tool.html` (see todo `17-`) → stats-card markup for arrangement and typography
- `docs/todos/16-zod-react-hook-form-validation.md` → React-Compiler note on `useWatch` vs `form.watch()`
