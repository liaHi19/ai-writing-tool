# Editor Client Components

## Overview
Build the four client components in `components/editor/` that make up the editor: `InputArea`, `ModeSelector`, `OutputPane`, and `CopyButton`. These are the building blocks `(app)/page.tsx` composes, and they own the user-facing interactivity — controlled input, mode selection, streamed text display, and clipboard.

## Requirements
- Create `components/editor/InputArea.tsx` — controlled `textarea` for the input text; exposes `value` + `onChange` (or accepts them from the parent), with sensible default sizing
- Create `components/editor/ModeSelector.tsx` — shadcn `select` bound to the `Mode` union from `lib/prompts.ts`; options must derive from `Mode` / `PROMPTS` keys, never a hardcoded literal list
- Create `components/editor/OutputPane.tsx` — read-only display for the streamed output; renders the in-flight `completion` text as it grows, including an empty state
- Create `components/editor/CopyButton.tsx` — copies the current output via `navigator.clipboard.writeText`; shows a transient confirmation (e.g. short-lived label flip or toast)
- All four files start with `"use client"`
- Prerequisite shadcn primitives: install `textarea` and `select` via `pnpm dlx shadcn@latest add textarea` and `pnpm dlx shadcn@latest add select`

## Notes
- Keep these components small and focused — no streaming hook here; that's wired in 13
- Don't edit files under `components/ui/` directly; wrap them in `components/editor/`
- Style with Tailwind utilities + the `cn()` helper from `lib/utils.ts`
- `CopyButton` disabled when there is no output yet is a nice touch but not required
- `ModeSelector` labels can be human-readable (e.g. "Improve", "Email") even though the underlying value is the `Mode` string

## References
- PRD §3 Session 3, bullet 2
- PRD §4 Session 3 acceptance criteria (all 6 modes selectable; copy button copies output)
- CLAUDE.md §Architecture → `components/editor/` (InputArea, ModeSelector, OutputPane, CopyButton)
- CLAUDE.md §Conventions → UI (shadcn primitives in `components/ui/`, wrappers in `components/editor/`)
- CLAUDE.md §Conventions → Prompts (`Mode` union is single source of truth)
