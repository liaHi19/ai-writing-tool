import "server-only";

import { createClient } from "@/lib/supabase/server";

export const DAILY_LIMIT = 10;

export type RateLimitResult = {
  ok: boolean;
  count: number;
  limit: number;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();
  const day = todayUtc();

  const { data, error } = await supabase
    .from("usage_daily")
    .select("count")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (error) throw error;

  const count = data?.count ?? 0;
  return { ok: count < DAILY_LIMIT, count, limit: DAILY_LIMIT };
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient();

  // Atomic upsert in Postgres (see `increment_usage` in lib/db/schema.sql).
  // Performing the read + write in a single statement avoids a TOCTOU race
  // where concurrent generations both read the same count and under-count it.
  const { error } = await supabase.rpc("increment_usage", {
    p_user_id: userId,
    p_day: todayUtc(),
  });

  if (error) throw error;
}
