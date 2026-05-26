# DB Schema, RLS Policies & Generated Types

## Overview
Define the Postgres schema for the two user-owned tables, enable Row Level Security, write the access policies, and generate TypeScript types from the live schema. This is the single source of truth for all database structure.

## Requirements
- Create `lib/db/schema.sql` with:
  - `generations(id, user_id, mode, input, output, model, created_at)` table
  - `usage_daily(user_id, day, count)` table
  - RLS enabled on both tables (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`)
  - `SELECT` policy on `generations`: `auth.uid() = user_id`
  - `INSERT` policy on `generations`: `auth.uid() = user_id`
  - `SELECT` policy on `usage_daily`: `auth.uid() = user_id`
  - `INSERT` / `UPDATE` policy on `usage_daily`: `auth.uid() = user_id`
- `supabase db reset` applies the schema cleanly with no errors
- Run `supabase gen types typescript --local > lib/db/types.ts` and commit the output
- RLS verified: a query executed as user A returns no rows owned by user B

## Notes
- Never hand-write types for DB rows — always use the generated `lib/db/types.ts`
- `usage_daily` needs an upsert-friendly unique constraint on `(user_id, day)` for the rate-limit increment to work correctly
- `model` column in `generations` should store the model id string (e.g. `claude-sonnet-4-6`) for auditability

## References
- PRD §3 Session 1, bullet 6
- PRD §4 Session 1 acceptance criteria (supabase db reset; RLS verified)
- CLAUDE.md §Architecture → DB tables
- CLAUDE.md §Rules (RLS on every user-owned table; policies scoped by auth.uid())
- CLAUDE.md §Conventions → Types (supabase gen types)
