# Mode Union & System Prompts

## Overview
Define the fixed set of 6 modes and the system prompt for each in `lib/prompts.ts`. This file is the single source of truth for the `Mode` type used by the API route, the mode selector UI, and validation.

## Requirements
- Create `lib/prompts.ts`:
  - Export `Mode` as a string-literal union: `"improve" | "email" | "linkedin" | "technical" | "casual" | "translate"`.
  - Export `PROMPTS: Record<Mode, string>` mapping each mode to a complete system prompt.
  - Each prompt should produce non-empty, on-topic output for typical inputs in that mode.
- Pure data module — no `"use cache"`, no side effects, no runtime config.
- Importable from both server (`/api/generate`) and client (mode selector) — must contain no server-only code.

## Notes
- The 6 modes are fixed for v1; no user-defined modes or prompt customization.
- The `translate` mode is a feature, not app i18n.
- Keep prompts concise but unambiguous about output format (e.g. "return only the rewritten text, no preamble").

## References
- PRD §1 (modes: fixed set of 6, one system prompt per mode)
- PRD §2 (no user-defined modes; no UI localization)
- PRD §3 Session 2, bullet 2
- PRD §4 Session 2 acceptance criteria (all 6 modes stream tokens; unknown mode → 400)
- CLAUDE.md §Conventions → Prompts (`Mode` is single source of truth)
