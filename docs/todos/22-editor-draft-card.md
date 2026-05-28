# Editor Draft Card

## Overview
Rebuild the input area as the **Draft card** (span 12): a minimal textarea (no inner border), a counter bar `<chars> / 2,400` that turns accent past ~88% fill, a "⌘+Enter to rewrite" hint, a Clear ghost button, and the primary **Rewrite as &lt;Mode&gt;** CTA. Bind ⌘/Ctrl + Enter at the panel level so the shortcut fires from anywhere on the page. Also adds the hard `max(2400)` cap to the Zod schema and clamps the client value to match.

## Requirements
- Create `components/editor/DraftCard.tsx` (replaces today's `components/editor/InputArea.tsx`)
- **Textarea:** large, minimal — no inner border, `bg: var(--surface)`, focus ring uses `var(--accent)`. `min-h-[280px]`, auto-grow disabled (vertical resize handle off — the card sets the bounds)
- **Counter bar:** sits in the card foot. Two parts:
  - Numeric: mono `<chars> / 2,400`
  - Bar: thin progress strip (`bg: var(--surface-2)`) filled with `var(--fg)` proportional to `chars / 2400`. **Past ~88% fill** (i.e. `chars >= 2112`), fill switches to `var(--accent)` and the numeric text turns accent — gives the user a clear "you're at the limit" cue
- **"⌘+Enter to rewrite" hint:** small mono text, `var(--fg-dim)`, sits to one side of the counter. Render as "⌘+Enter" on macOS (`navigator.platform` / `userAgent` check) and "Ctrl+Enter" elsewhere
- **Clear button:** ghost variant, sits in the card foot. Calls `form.setValue("text", "", { shouldValidate: true })`
- **Rewrite CTA:** primary button, label is `Rewrite as ${MODE_META[mode].name}` driven by the watched `mode` field. Disabled when `text.trim().length < 10` (existing rule from session 8) or while the stream is in flight (`isLoading`)
- **⌘/Ctrl + Enter shortcut:** bind a `keydown` listener at the `EditorPanel` level (not inside the textarea) — when `(e.metaKey || e.ctrlKey) && e.key === "Enter"` and the form is valid, call `form.handleSubmit(onSubmit)()`
- **Schema cap:** edit `lib/validation/generate.ts` so `text` is `z.string().trim().min(10, …).max(2400, "Text cannot exceed 2,400 characters")` — keep the existing `min(10)` message
- **Client clamp:** in the textarea's `onChange`, slice to 2,400 before calling `field.onChange` so users physically can't exceed the cap (defence in depth on top of the schema); paste-larger-than-cap is truncated, not rejected
- Slot the card into the bento grid at `col-span-12`

## Notes
- Bind the keyboard shortcut on the `EditorPanel`'s root `<div>` with `tabIndex={-1}` (or on `window` via `useEffect` — either works; pick what the prototype prefers). Don't bind only on the textarea — the PRD says "from anywhere on the page"
- The 88% threshold is the prototype's specific value; the exact pixel ratio is `chars / 2400 >= 0.88`. The new `text.max(2400)` ensures `chars` can never exceed `2400`, so the bar can't overflow
- The CTA label depends on `mode` — read it with `useWatch({ control, name: "mode" })`, same React-Compiler-safe pattern as the Stats card (todo `21-`)
- Do **not** change the `onSubmit` path or the `useCompletion` wiring; just trigger `form.handleSubmit` from the new sources (button click, ⌘+Enter)
- The toast for `400 / 429 / 500` responses is already wired (session 6) — keep that path; if the `400` returns a Zod max-length message, it'll surface via the existing toast pattern automatically

## References
- PRD §3 Session 5 → "Draft card (span 12): minimal textarea …, counter bar `<chars> / 2,400`, ⌘+Enter to rewrite hint, Clear ghost button + primary Rewrite as &lt;Mode&gt; CTA. Counter turns accent past ~88% fill"
- PRD §3 Session 5 → "⌘/Ctrl + Enter shortcut bound at the panel level triggers Rewrite when input ≥ 10 chars"
- PRD §3 Session 5 → "New `text` cap: `max(2400)` added to `lib/validation/generate.ts`"
- PRD §4 Session 5 → "Input is capped at 2,400 chars (client clamp + Zod `.max(2400)`); counter goes accent past ~88% fill; Rewrite button is disabled below 10 chars"
- PRD §4 Session 5 → "⌘/Ctrl + Enter from anywhere on the page triggers Rewrite when valid"
- `AI Writing Tool.html` (see todo `17-`) → draft-card markup for textarea sizing, counter bar geometry, and hint placement
- `docs/todos/16-zod-react-hook-form-validation.md` → existing schema + RHF pattern to extend
