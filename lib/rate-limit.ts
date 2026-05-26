import "server-only";

import { createClient } from "@/lib/supabase/server";

export const DAILY_LIMIT = 5;

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
  const day = todayUtc();

  const { data, error: selectError } = await supabase
    .from("usage_daily")
    .select("count")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (selectError) throw selectError;

  const nextCount = (data?.count ?? 0) + 1;

  const { error: upsertError } = await supabase
    .from("usage_daily")
    .upsert(
      { user_id: userId, day, count: nextCount },
      { onConflict: "user_id,day" },
    );

  if (upsertError) throw upsertError;
}
