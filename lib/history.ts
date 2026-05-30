import { cacheLife, cacheTag } from "next/cache";
import type { Tables } from "@/lib/db/types";
import {
  countGenerationsByUserId,
  fetchGenerationsByUserId,
} from "@/lib/supabase/server-admin";

export type Generation = Tables<"generations">;

export async function fetchHistory(userId: string): Promise<Generation[]> {
  "use cache";
  cacheTag(`history:${userId}`);
  cacheLife("hours");
  return fetchGenerationsByUserId(userId);
}

export async function fetchHistoryCount(userId: string): Promise<number> {
  "use cache";
  cacheTag(`history:${userId}`);
  cacheLife("hours");
  return countGenerationsByUserId(userId);
}
