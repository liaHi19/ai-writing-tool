# App Header Restyle

## Overview
Rebuild the `<Header />` rendered from `app/(app)/layout.tsx` to match the Polish prototype. A 3-column grid (`1fr auto 1fr`) with: brand mark + two-line wordmark on the left, a pill-shaped segmented Write/History tab nav in the middle (icons + label, active driven by `usePathname()`, with an **entry-count pill** on History), and a mono-caps **meta string** + user chip + sign-out icon button on the right. Replaces today's plain link bar.

## Design tokens (from the Polish prototype)
```
--bg: #f4f1ec        --surface: #fbf9f5     --surface-2: #efece6
--border: #e2dcd0    --fg: #1a1816          --fg-muted: #7a736a
--fg-dim: #a8a097    --accent: #c2410c      --accent-fg: #fbf9f5
--radius: 18px       --radius-sm: 10px
```

## Requirements

### File
- Update [components/layout/Header.tsx](components/layout/Header.tsx) (already exists under `components/layout/`) — keep it rendered from `app/(app)/layout.tsx`. The outer file stays a server component; introduce a sibling `"use client"` `<HeaderNav />` for the parts that need `usePathname()`.

### Layout
- `.header` — `display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; margin-bottom: 28px;`. The last child (`.header-right`) is right-aligned.
- **No** `position: sticky`, **no** backdrop blur, **no** bottom border — the header sits flush in the page background.
- Mobile: `.header-right { justify-content: flex-start; flex-wrap: wrap; }` and hide `.header-meta` only. Tabs keep both icon and text (no icon-only collapse).

### Left region — brand
- 28×28 brand mark "P", `border-radius: 9px`, **`background: var(--fg)`** / **`color: var(--bg)`** (dark fill, not accent), `font-family: var(--font-mono)`, weight 500, 14 px, letter-spacing `-0.02em`.
- Two-line wordmark next to it:
  - `.brand-name` — `Polish`, Geist Sans 17 px, weight 500, letter-spacing `-0.01em`.
  - `.brand-sub` — `WRITING · V0.4`, Geist Mono 11 px, uppercase, letter-spacing `0.08em`, color `var(--fg-muted)`.

### Middle region — segmented tabs
- Outer `<nav class="tabs">`: `display: inline-flex; background: var(--surface); border: 1px solid var(--border); border-radius: 99px; padding: 4px; gap: 2px;`.
- Each `.tab`: `padding: 7px 16px; border-radius: 99px;` Geist Sans 13 px / weight 500, letter-spacing `-0.005em`, transitions on `color` + `background` (120 ms). Icon + label with an 8 px gap.
  - Inactive: `background: transparent; color: var(--fg-muted);` hover → `color: var(--fg)`.
  - Active (`data-on="true"`, driven by `usePathname()`): `background: var(--fg); color: var(--bg);` — **not** `--accent-fg`. Also set `aria-current="page"`.
- Tabs: `Write` (`/`, write glyph) and `History` (`/history`, history glyph).

### Entry-count pill on History
- `.tab .pill` — Geist Mono 10 px, `padding: 1px 6px; border-radius: 99px; letter-spacing: 0.04em;`.
  - Default: `background: var(--surface-2); color: var(--fg-muted);`.
  - Inside an active tab: `background: rgba(255, 255, 255, 0.16); color: var(--bg);`.
- Always render — `0` is allowed and shown.
- Count is read server-side via the same fetcher used by [components/history/HistoryList.tsx](components/history/HistoryList.tsx) (todo `25-`) and passed down as a prop — do not duplicate the query.

### Right region
- `.header-meta` — Geist Mono 11 px, uppercase, letter-spacing `0.08em`, color `var(--fg-muted)`. Shows `{MODE} MODE` on `/` and `{N} ENTRIES` on `/history`. The active mode is client-side editor state; render this slot inside `<HeaderNav />` and source the mode from the URL query or a small shared store. The entries variant is the load-bearing one — if mode-wiring proves fiddly, ship the entries case first.
- `.user-chip` — `display: inline-flex; align-items: center; gap: 10px; padding: 4px 4px 4px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 99px;`. Contains:
  - `.user-chip-name` — 13 px, weight 500, `color: var(--fg)`. Derived from the email local-part: `user.email.split("@")[0]` (we only have `email` on the Supabase user; the local-part stands in for a first name).
  - `.avatar` — 28×28 round, `background: var(--fg); color: var(--bg);` Geist Mono 11 px, weight 500. Initials derived from the local-part — take up to two letters: `"natalia"` → `NA`; `"john.doe"` → `JD`.
- `.signout-btn` — 28×28 round transparent icon button (sign-out glyph), `color: var(--fg-muted)`; hover → `background: var(--surface-2); color: var(--fg)`. Calls the existing `signOut()` server action from [actions/auth.ts](actions/auth.ts) — reuse or inline the wiring already in [components/auth/SignOutButton.tsx](components/auth/SignOutButton.tsx).

## Notes
- The header is split — outer is a **server component** (so it can `await` the user + count), inner is a small `"use client"` `<HeaderNav />` that owns `usePathname()`, the segmented tabs, and the `.header-meta` mode slot. Keep auth + count fetching server-side.
- Reuse `getAuthenticatedUser` (the helper in [lib/supabase/server.ts](lib/supabase/server.ts), introduced in the recent refactor — see also [actions/auth.ts](actions/auth.ts)) for the user lookup so the header and the cached fetcher share the same identity flow.
- The entry-count pill must update after delete / clear-all. Both mutations call `revalidateTag(\`history:${user.id}\`)` (todo `24-`), which invalidates the cached fetcher, which re-renders the header on the next request — no extra wiring needed.
- Don't pass `cookies()` into `"use cache"` to read the count — pass the explicit `userId`, same rule as the history fetcher (CLAUDE.md §Next.js 16 → Cache layer).
- The "P" brand mark is text, not an SVG — keeps the bundle lean.
- The tab icons are inline SVGs — co-locate a tiny `<Icon d=… />` helper plus a `HEADER_ICONS` map (`write`, `history`, `signout`) in the same module rather than pulling in an icon library.

## References
- PRD §3 Session 5 → "Editor (`/`) — rebuild as bento" → Header bullet
- PRD §4 Session 5 → "Header shows brand mark + Polish wordmark, segmented Write/History nav (active driven by `usePathname()`, entry-count pill on History), user email + sign-out on the right"
- PRD §4 Session 5 → "Clear-all → … entry-count pill on the Header tab decrements/disappears accordingly"
- Design tokens, class names, and exact CSS values are sourced from the bundled `<style>` block in [Polish - AI Writing Tool.html](Polish%20-%20AI%20Writing%20Tool.html) (see todo `17-`). Cross-reference `.header`, `.brand`, `.brand-mark`, `.brand-name`, `.brand-sub`, `.tabs`, `.tab`, `.pill`, `.header-meta`, `.user-chip`, `.user-chip-name`, `.avatar`, `.signout-btn`, `.header-right`.
- CLAUDE.md §Next.js 16 → Cache layer (`"use cache"` discipline for the count fetcher)
