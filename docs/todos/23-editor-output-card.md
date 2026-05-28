# Editor Output Card

## Overview
Replace the current `OutputPane` with the **Output card** (span 12): an empty-state pulse-dot + label until the first stream lands, then the streamed text body. **Copy** and **Save** buttons sit in the card head; the card foot shows `<chars> · <words>` plus the active mode name. Save triggers a `.txt` download named `polish-<mode>-<timestamp>.txt`; Copy reuses the existing clipboard pattern and confirms via a `sonner` toast.

## Requirements
- Create `components/editor/OutputCard.tsx` (replaces `components/editor/OutputPane.tsx`)
- **Card head:** title "Output" (Geist Sans), right side has two icon buttons — Copy and Save. Both disabled when the output is empty
- **Body — empty state:** centered pulse-dot (small accent circle with `animate-pulse`) + label like "Output appears here". Whole region uses `var(--fg-dim)` for the label
- **Body — populated state:** stream tokens render live (keep the existing `useCompletion` plumbing). Preserve the existing animated cursor at the tail while `isLoading`
- **Copy button:** reuse `components/editor/CopyButton.tsx` (already handles 2 s check-icon flip). On success, fire `toast.success("Copied")` — wrap the existing button or thread a callback through, whichever is cleanest
- **Save button:** new behavior. On click:
  - Build `polish-${mode}-${timestamp}.txt` where `timestamp` is `new Date().toISOString().replace(/[:.]/g, "-")` (filesystem-safe)
  - Trigger a download via the canonical Blob + `URL.createObjectURL` + temporary `<a download>` pattern (no library)
  - Fire `toast.success("Saved")` after the click is dispatched
  - Disabled when `output` is empty or `isLoading`
- **Card foot:** mono `<chars> · <words>` (computed from the current `output`) + the mode name. Hidden when output is empty
- Slot the card into the bento grid at `col-span-12` (below the Draft card from todo `22-`)

## Notes
- Keep `OutputCard` `"use client"` — it owns the stream rendering and click handlers
- The Save handler is fine inline in the client component; no need to introduce a `lib/` helper for one-off file generation
- Reuse the word/char counting helper from the Stats card (todo `21-`) — extract to `lib/text/stats.ts` if both cards end up importing it; otherwise inline (under three call sites is fine)
- The empty-state pulse-dot is the prototype's signature element — match its size and color (likely 6–8 px accent circle, `animate-pulse`)
- Do **not** persist the streamed output to localStorage or any client cache — history persistence happens server-side in `/api/generate`'s `onFinish` (already wired)

## References
- PRD §3 Session 5 → "Output card (span 12): empty-state pulse dot + label, Copy and Save buttons in the head, foot meta `<chars> · <words>` + mode name"
- PRD §4 Session 5 → "Output card's Save action downloads a `.txt` file named `polish-<mode>-<timestamp>.txt`; Copy confirms via toast"
- `AI Writing Tool.html` (see todo `17-`) → output-card markup for head/body/foot proportions and pulse-dot styling
- `components/editor/CopyButton.tsx` — existing clipboard primitive to reuse
