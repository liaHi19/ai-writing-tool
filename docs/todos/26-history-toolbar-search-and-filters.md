# History Toolbar — Search, Filter Chips, Clear-All

## Overview

Add a toolbar above the history bento grid (todo `25-`) with three controls: a search input, six filter chips (All + the 5 modes, each with a count badge), and a Clear-all action. Search and filtering happen **client-side** over the full cached server-fetched list — the server fetcher stays unchanged. Clear-all opens a confirm dialog and calls `clearAllGenerations()` from todo `24-`.

## Requirements

- Create `components/history/HistoryToolbar.tsx` as a `"use client"` component
- The history page passes the full cached list of generations down to the toolbar; the toolbar holds `filter` (`Mode | "all"`) and `query` (string) state and renders the filtered subset into the grid from todo `25-`. Restructure the data flow so the toolbar wraps the grid (or hoist the filtered list into a shared client parent that owns both)
- **Search input:**
  - Single-line, mono placeholder ("Search generations…")
  - Filters case-insensitively over both `input` and `output` fields
  - Debounce is needed, create custom hook - useDebounce
- **Filter chips:** All + 5 modes (`improve`, `email`, `linkedin`, `technical`, `casual`)
  - Each chip shows the mode name and a small mono count badge in parentheses
  - **Counts reflect unfiltered totals** — e.g. `Email (7)` always shows the user's total Email generations, not the count after applying the search query. The chips are navigation, not summary stats of the current view
  - Active chip uses the same dark-fill treatment as the active Mode card button (todo `20-`)
- **Clear-all button:** ghost variant, sits to the right of the chips
  - On click → shadcn `<AlertDialog />` (install if not yet present: `pnpm dlx shadcn@latest add alert-dialog`) with copy "Delete all generations? This can't be undone."
  - On confirm → call `clearAllGenerations()` → on `{ ok, deleted }`, fire `toast.success(\`Deleted ${deleted} generations\`)`; on `{ error }`, `toast.error(error)`
  - After the cache invalidates, the grid shows the empty state from todo `25-` and the header's entry-count pill (todo `19-`) drops to `0` on the next render
- Hide the toolbar entirely when the user has zero generations (the empty state owns the screen)

## Notes

- Client-side filtering keeps things simple and avoids extra cache permutations (no need for a `cacheTag(\`history:${userId}:${mode}\`)`style). The per-user quota caps the list size, so an in-memory`.filter()` is fine
- The filter + search compose: chip selection narrows by mode first, then the search query narrows within the chip selection. The chips' count badges stay frozen at the per-mode totals
- The state lives in the toolbar (or a small shared parent); the cached fetcher and the per-card delete (todo `25-`) work unchanged
- `clearAllGenerations` returns the deleted count for the toast — that's its main reason for returning anything beyond `{ ok }`

## References

- PRD §3 Session 5 → "Toolbar: search input, filter chips (All + 5 modes, each with count), Clear-all action"
- PRD §3 Session 5 → "Search + filtering are client-side over the cached server-fetched list"
- PRD §4 Session 5 → "Search input + filter chips narrow the visible cards client-side; chip counts reflect unfiltered totals"
- PRD §4 Session 5 → "Clear-all → confirm dialog → `clearAllGenerations()` removes all rows for the user; empty state appears; entry-count pill on the Header tab decrements/disappears accordingly"
- `AI Writing Tool.html` (see todo `17-`) → toolbar markup for chip geometry, search-input styling, and clear-all placement
