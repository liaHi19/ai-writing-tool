import { fetchHistory } from "@/lib/history";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { HistoryView } from "./HistoryView";

export async function HistoryList() {
  const { user } = await getAuthenticatedUser();

  if (!user) return null;

  const generations = await fetchHistory(user.id);

  return <HistoryView generations={generations} />;
}
