# Per-User Daily Rate Limit

## Overview
Implement `lib/rate-limit.ts` to enforce a hardcoded daily quota per user against the `usage_daily` table. The `/api/generate` route must call this before invoking the model and must increment the counter exactly once per successful generation.

## Requirements
- Create `lib/rate-limit.ts`:
  - Export `DAILY_LIMIT` constant (hardcoded number; pick a sensible default such as 50).
  - Export `checkRateLimit(userId: string)` that reads today's `usage_daily` row for the user and returns whether they are over quota (or throws/returns a typed result the route can map to `429`).
  - Export `incrementUsage(userId: string)` that upserts the `(user_id, day)` row, incrementing `count` by 1 atomically.
  - Use the server-side Supabase client from `lib/supabase/server.ts`.
- `checkRateLimit` runs before every model call in `/api/generate`.
- `incrementUsage` is invoked inside the `onFinish` callback of the stream, so today's `count` increments by exactly 1 per successful stream.
- "Today" is computed in a stable timezone (UTC) so the `day` column matches between read and write.

## Notes
- The composite PK `(user_id, day)` on `usage_daily` already exists from the schema migration; rely on `upsert` semantics with `onConflict: "user_id,day"`.
- No payments or plan tiers — the limit is a single hardcoded constant.
- Do not couple this module to the Anthropic client; it only touches Supabase.

## References
- PRD §1 (hardcoded daily quota per user)
- PRD §2 (no payments, no billing UI)
- PRD §3 Session 2, bullet 3
- PRD §4 Session 2 acceptance criteria (`429` over quota; `usage_daily.count` incremented by exactly 1)
- CLAUDE.md §Rules (always check the rate limit before invoking the model)
- CLAUDE.md §Architecture (`usage_daily` incremented per successful generation)
