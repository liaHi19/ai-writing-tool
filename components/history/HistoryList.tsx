import Link from "next/link";

import { fetchHistory } from "@/lib/history";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { HistoryCard } from "./HistoryCard";

export async function HistoryList() {
  const { user } = await getAuthenticatedUser();

  if (!user) return null;

  const generations = await fetchHistory(user.id);

  return (
    <>
      {generations.length > 0 ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {generations.map((gen) => (
            <HistoryCard key={gen.id} gen={gen} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="rounded-(--radius) border bg-(--surface) px-10 py-8 text-center">
            <p className="text-sm text-(--fg-muted)">No generations yet.</p>
            <Link
              href="/"
              className="mt-2 inline-block text-sm text-accent underline underline-offset-2"
            >
              Create one
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
