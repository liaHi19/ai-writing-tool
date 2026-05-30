# Edit Generated Output — In-Place Before Copy / Save

## Overview

Today the `OutputCard` (todo `23-`) renders the streamed model response read-only — the user can Copy it or explicitly Save it via the `saveGeneration` server action, but cannot change a single word first. This todo adds an **edit affordance**: once a generation has finished streaming, the user can edit the output text in place, and the edited text becomes the source of truth for both Copy and Save. This is a **client-side UI/state change in the editor** — no changes to the `/api/generate` route, the streaming protocol, `useGenerate`'s `useCompletion` wiring, prompts, rate limit, or DB schema. The `saveGeneration` action keeps its existing signature; it just receives the (possibly edited) output string.

## Requirements

- **Edit only after streaming completes:**
  - The output is editable only when the stream has finished (`useGenerate`'s loading/streaming flag is `false`). While tokens are still streaming the output stays read-only
  - Starting a new generation (Rewrite) replaces the editable buffer with the fresh streamed completion and discards any prior manual edits
- **Edit-mode UX (in `OutputCard`):**
  - Provide a clear toggle (e.g. an "Edit" button / pencil affordance in the card head) that switches the rendered output into an editable `Textarea` (shadcn) seeded with the current output text
  - Edited text round-trips: leaving edit mode keeps the user's changes visible
  - Keep the card chrome/scroll behaviour from todo `23-`; the editable area should match the read view's sizing so the card doesn't jump on toggle
- **Copy + Save use the edited text:**
  - `CopyButton` copies the current (edited) output, not the original streamed text
  - The Save action persists the current (edited) output via the existing `saveGeneration` server action — do **not** add an auto-save; saving stays opt-in per CLAUDE.md
- **State source of truth:**
  - The editable value derives from `useGenerate`'s `completion` as its initial value, then becomes locally controlled once the user edits. Re-streaming resets it. The Clear button (todo `22-`) clears it along with the rest of the output state
- **Empty / edge states:** an emptied output disables Copy/Save (nothing to copy or persist); editing never sends anything back to the model
- **A11y:** the Edit toggle is a real `button` with an accessible label and reflects its pressed/edit state (`aria-pressed`); the editable `Textarea` is focusable and labelled
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build` all return zero errors

## Notes

- **Scope is the editor output only.** Do not touch the `saveGeneration` action internals, `/api/generate`, the `useCompletion` wiring inside `useGenerate`, prompts, or the DB. Editing is purely local string state layered on top of the streamed `completion`
- The cleanest model is a local `editedOutput` state initialised from `completion`; render `editedOutput ?? completion`. When a new run starts (`completion` is replaced) reset `editedOutput`. Confirm the exact reset trigger against how `useGenerate` exposes its streaming/completion state
- Don't introduce a second textarea in `components/ui/` — reuse the shadcn `Textarea` primitive already used by `DraftCard` (todo `22-`), per the shadcn-only rule for `components/ui/`
- Watch interaction with the `⌘/Ctrl+Enter` Rewrite shortcut (todo `22-`): typing in the output editor must not trigger a re-generate; keep the shortcut scoped to the draft input only
- The mode label / stats (todos `13`, `21`) describe the *input*, not the output — leave them untouched

## References

- `docs/todos/23-editor-output-card.md` → `OutputCard`, Copy + Save actions, and the `useGenerate` hook this builds on
- `docs/todos/22-editor-draft-card.md` → draft `Textarea`, Clear button, and `⌘/Ctrl+Enter` shortcut to coordinate with
- `docs/todos/24-history-server-actions-and-cache-fix.md` → server-action + cache-tag conventions the `saveGeneration` path follows
- `docs/todos/18-design-system-cool-fog-tokens.md` → tokens/chrome the edit view must match
- `CLAUDE.md` → "Persisting a generation is opt-in via `saveGeneration`; do not auto-insert" rule that still holds
