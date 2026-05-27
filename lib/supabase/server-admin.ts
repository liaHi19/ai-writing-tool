import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/db/types";

// Service-role client kept private so the elevated key cannot be reused
// for arbitrary queries. Each admin-privileged query gets its own narrow
// helper below that must filter by user_id.
function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Fetch a user's generations, newest first. Bypasses RLS — caller is
 * responsible for having authenticated the user before passing userId.
 * Safe to call inside "use cache" because it does not read cookies().
 */
export async function fetchGenerationsByUserId(
  userId: string,
): Promise<Tables<"generations">[]> {
  const { data, error } = await adminClient()
    .from("generations")
    .select("id, user_id, mode, input, output, model, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchGenerationsByUserId error:", error);
    return [];
  }

  return data ?? [];
}
