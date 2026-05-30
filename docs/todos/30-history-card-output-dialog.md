# History Card — Open Full Output in a Dialog on Click

## Overview

In the history grid (todos `25-`, `26-`) each `HistoryCard` shows a **truncated** preview of a past generation plus Copy and Delete actions. There is no way to read the full output without copying it elsewhere. This todo makes the **main body of the card clickable**: clicking it opens a Dialog showing the complete generation (mode, date, full input and/or full output), where the user can also **edit the output and save the changes back to that generation**. **Critically, the existing Copy and Delete controls must keep behaving exactly as they do today** — clicking either one must perform its action and must **not** open the dialog. The clickable-card + Dialog presentation is client-side; the **save-edit** path adds one new `updateGeneration` server action (plus an RLS `update` policy and the existing cache-tag invalidation). The opt-in `saveGeneration` insert (todo `23-`), `deleteGeneration`/`clearAllGenerations` (todo `24-`), and the row shape are otherwise unchanged.

## Requirements

- **Clickable card body opens the dialog:**
  - Clicking the main/content area of a `HistoryCard` opens a Dialog (shadcn `Dialog`) containing the full output text, plus the mode badge, created-at, and input for context
  - The dialog content is scrollable for long outputs and respects the cool-fog tokens / card chrome (todo `18-`)
- **Copy and Delete are unaffected (the key constraint):**
  - The existing `CopyButton` still copies the full output and shows its toast — clicking it does **not** open the dialog
  - The existing Delete still opens the `ConfirmDialog` (`components/shared/`) and calls the `deleteGeneration` server action with cache invalidation (todo `24-`) — clicking it does **not** open the output dialog
  - Implement by stopping propagation on the action controls (or rendering them outside the clickable region) so their click never bubbles to the card's open handler
- **Edit & save the output (inside the dialog):**
  - The dialog renders the full output in an editable `Textarea` (reuse the in-place edit pattern from todo `29-`), seeded with the stored output. Only `output` is editable — `mode`, `input`, and `created_at` stay read-only
  - A **Save** button persists the edited output back to **the same generation row** via a new `updateGeneration(id, output)` server action — this is an **update**, not the insert that `saveGeneration` (todo `23-`) performs, and not a new row
  - `updateGeneration` authenticates the user, updates only its own row (RLS-scoped by `auth.uid()`), and calls `revalidateTag(\`history:${userId}\`)` so the grid reflects the change — mirroring the invalidation pattern in todo `24-`
  - Save is disabled until the text is dirty (changed from stored) and non-empty; on success show a toast (`sonner`) and reflect the saved text in the card/dialog. Closing behaviour: keep the dialog open showing the saved state (closing on success is acceptable if simpler) — never lose unsaved edits silently
  - Editing in the dialog must not affect the editor's own output state (todo `29-`); the two edit surfaces are independent
- **A11y / semantics:**
  - The clickable region is keyboard operable (Enter/Space) and has an accessible name describing what it opens
  - **Avoid nesting interactive buttons inside a parent `<button>`/`<a>`** — that is invalid HTML and breaks Copy/Delete focus. Prefer an `onClick`/`onKeyDown` handler on a `div` with `role="button"` + `tabIndex={0}`, and `e.stopPropagation()` on the action cluster — or position the action cluster as a sibling overlay outside the clickable content node
  - The Dialog has a title, is focus-trapped, and closes on Esc / overlay click / close button (shadcn defaults)
- **Reuse, don't fork:** the dialog may offer Copy inside it (reuse `CopyButton`). Deleting from inside the dialog is optional — if added, it must go through the same `ConfirmDialog` + `deleteGeneration` path and close the dialog on success
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build` all return zero errors

## Notes

- **The only new server-side surface is `updateGeneration`.** Don't change `deleteGeneration`, `clearAllGenerations`, `saveGeneration`, the cache-tag scheme, or the row shape (todo `24-`). The clickable-card and read view render data already present on the card; only the save-edit path touches the server
- **`updateGeneration` needs an RLS `update` policy.** Per CLAUDE.md, every user-owned table has explicit policies scoped by `auth.uid()` — the `generations` table currently has `select`/`insert` policies (todo `06-`); add a matching `update` policy in `lib/db/schema.sql` (and a migration) so a user can only update their own rows. The action goes through `lib/supabase/server.ts`, never a direct `createClient`
- An `updated_at` column is **optional** and out of scope unless trivial — updating `output` in place is enough for this todo
- Reuse the edit affordance from todo `29-` rather than inventing a second pattern; the dialog editor and the main `OutputCard` editor should feel the same
- If shadcn `Dialog` isn't installed yet, add it with `pnpm dlx shadcn@latest add dialog` (lands in `components/ui/`, shadcn-only per CLAUDE.md). Do **not** hand-roll a modal in `components/ui/`
- The trap to avoid: wrapping the whole card in a `<button>` puts Copy and Delete *inside* an interactive element and makes their clicks bubble to the open handler. The `div role="button"` + `stopPropagation()` pattern (or sibling-overlay actions) sidesteps both problems
- Keep the filtering/search behaviour (`HistoryView`, `HistoryToolbar`, todo `26-`) intact; opening a dialog must not reset filters or search
- If the preview text is user-selectable, a drag-to-select ideally shouldn't fire the open handler — honour that only if it's trivial; otherwise keep the handler simple

## References

- `docs/todos/25-history-bento-card-grid.md` → `HistoryCard` body + Copy/Delete actions this extends
- `docs/todos/26-history-toolbar-search-and-filters.md` → `HistoryView` / `HistoryToolbar` filtering that must stay intact
- `docs/todos/24-history-server-actions-and-cache-fix.md` → `deleteGeneration` + `revalidateTag` invalidation pattern the new `updateGeneration` action must mirror
- `docs/todos/29-editor-edit-generated-output.md` → in-place edit affordance to reuse for the dialog editor
- `docs/todos/23-editor-output-card.md` → the opt-in `saveGeneration` **insert**, contrasted with the dialog's `updateGeneration` **update**
- `docs/todos/06-db-schema-rls-types.md` → `generations` schema + RLS policies; add the `update` policy here
- `components/shared/ConfirmDialog.tsx` (session 20 relocation) → delete-confirm flow to reuse as-is
- `docs/todos/18-design-system-cool-fog-tokens.md` → tokens/chrome the dialog should match
