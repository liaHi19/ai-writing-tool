# Anthropic SDK Client & Pinned Model Id

## Overview
Centralize the Anthropic SDK client and the model id string in `lib/anthropic.ts` so the rest of the codebase imports a single constant and configured provider. This is the single source of truth for "which model do we call."

## Requirements
- Create `lib/anthropic.ts`:
  - Export `MODEL_ID = "claude-sonnet-4-6"` as a `const` string literal.
  - Export a configured `@ai-sdk/anthropic` provider instance that reads `ANTHROPIC_API_KEY` from `process.env`.
  - Server-only module — must never be imported from a client component.
- `ANTHROPIC_API_KEY` must not appear in any client bundle (verified by inspecting `pnpm build` output).
- No other file in the repo hardcodes the model id string; everything imports `MODEL_ID`.

## Notes
- Vercel AI SDK packages: `ai` + `@ai-sdk/anthropic` are already part of the planned stack.
- Keep this file tiny — no business logic, no streaming helpers. Just the provider + constant.

## References
- PRD §3 Session 2, bullet 1
- PRD §4 Session 2 acceptance criteria (API key not in client bundle)
- CLAUDE.md §Stack (AI: pinned `claude-sonnet-4-6`)
- CLAUDE.md §Rules (never expose `ANTHROPIC_API_KEY`; use the pinned model id from `lib/anthropic.ts`)
