# Editor Output Card

## Overview
Replace the current `OutputPane` with the **Output card** (span 12): an empty-state pulse-dot + label until the first stream lands, then the streamed text body. **Copy** and **Save** buttons sit in the card head; the card foot shows `<chars> · <words>` plus the active mode name. **Save** persists the current `{ mode, input, output }` triple to the `generations` table via a new `POST /api/generations` endpoint (the auto-insert in `/api/generate`'s `onFinish` is removed in this session). **Copy** writes the output to the clipboard and confirms via a `sonner` toast.

## Requirements

### Component (`components/editor/OutputCard.tsx`)
- Create `components/editor/OutputCard.tsx` (replaces `components/editor/OutputPane.tsx`)
- `"use client"` — owns stream rendering, clipboard, and save handlers
- **Card head:** title "Output" (Geist Sans) on the left; right side has two icon buttons — Copy and Save. Both disabled when the output is empty
- **Body — empty state:** centered pulse-dot (6–8 px accent circle with `animate-pulse`) + label like "Output appears here". Label uses `var(--fg-dim)`
- **Body — populated state:** stream tokens render live (keep the existing `useCompletion` plumbing); preserve the animated cursor at the tail while `isLoading`
- **Copy button:** copies `completion` to `navigator.clipboard`; 2 s check-icon flip; on success fire `toast.success("Copied")`
- **Save button:** POSTs `{ mode, input, output }` to `/api/generations`
  - Disabled when `output` is empty, `isLoading`, or already saved for the current completion
  - On 2xx: fire `toast.success("Saved to history")` and lock the button until the next completion arrives (reset `saved` state via `useEffect` keyed on `completion` length transition)
  - On non-2xx: parse `{ error }` from the body and fire `toast.error(error)`
  - Show a busy state (spinner or muted icon) while the request is in flight
- **Card foot:** mono `<chars> · <words>` (computed from the current `output`) + the mode name. Hidden when output is empty
- Slot into the bento grid at `col-span-12` (below the Draft card from todo `22-`)
- Pass `control` (RHF) so the card can `useWatch` the current `mode` and `text` for the save payload + foot label

### Backend (new endpoint + generate-route cleanup)
- **New file:** `app/api/generations/route.ts`
  - `POST` handler accepts `{ mode, input, output }` (validate with a new Zod schema in `lib/validation/generate.ts` — call it `saveGenerationSchema`: `mode` from `MODES` enum, `input` and `output` as non-empty strings; cap `output` length conservatively, e.g. 16 KB)
  - Requires auth via `getAuthenticatedUser()`; `401` if absent
  - Inserts a row into `generations` with `user_id`, `mode`, `input`, `output`, `model: MODEL_ID`
  - On success calls `revalidateTag(\`history:${user.id}\`)`
  - Returns `{ id }` on success, `{ error }` on failure
- **Edit `app/api/generate/route.ts`:** remove the `generations` insert and the `revalidateTag` call from `onFinish`. **Keep** the `incrementUsage(userId)` call — rate-limiting tracks API invocations, not saves.

## Notes
- The Save state lives in `OutputCard`'s local state (`const [saved, setSaved] = useState(false)`); reset when `completion` transitions from non-empty to empty *or* when a new stream begins (watch `isLoading` going `false → true`). A minimal implementation: `useEffect(() => { setSaved(false); }, [isLoading])`
- The empty-state pulse-dot is the prototype's signature element — match its size and color (6–8 px accent circle, `animate-pulse`)
- Word/char helpers live in `lib/helpers.ts` (`countWords`, `countChars`) — reuse them
- Do **not** persist the streamed output to `localStorage` or any client cache; the Save endpoint is the single source of truth for history persistence
- **UX consequence of removing auto-save:** a generation that the user does not explicitly save is lost when they close the tab. That is the intended behavior — Save = intent to keep

## References
- PRD §3 Session 5 → "Output card (span 12): empty-state pulse dot + label, Copy and Save buttons in the head, foot meta `<chars> · <words>` + mode name"
- `Polish - AI Writing Tool.html` (see todo `17-`) → output-card markup for head/body/foot proportions and pulse-dot styling
- `app/api/generate/route.ts` — existing route whose `onFinish` insert is being removed in this session
- `lib/supabase/server.ts` `getAuthenticatedUser()` — auth helper to reuse in the new route
- `lib/helpers.ts` — `countWords`, `countChars` for the foot meta
