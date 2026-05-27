import type { Tables } from "@/lib/db/types";
import { formatDate, truncate } from "@/lib/helpers";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { fetchGenerationsByUserId } from "@/lib/supabase/server-admin";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { CopyButton } from "../editor/CopyButton";

type Generation = Tables<"generations">;

async function fetchHistory(userId: string): Promise<Generation[]> {
  "use cache";
  cacheTag(`history:${userId}`);
  cacheLife("hours");

  return fetchGenerationsByUserId(userId);
}

export async function HistoryList() {
  const { user } = await getAuthenticatedUser();

  if (!user) return null;

  const generations = await fetchHistory(user.id);

  if (generations.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No generations yet.{" "}
        <Link href="/" className="underline underline-offset-2">
          Create one
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {generations.map((gen) => (
        <li key={gen.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800">
              {gen.mode}
            </span>
            <time dateTime={gen.created_at} className="text-xs text-zinc-400">
              {formatDate(gen.created_at)}
            </time>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Input
            </p>
            <p className="text-sm text-zinc-700">{truncate(gen.input, 220)}</p>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Output
              </p>
              <CopyButton text={gen.output} />
            </div>
            <p className="text-sm text-zinc-700">{truncate(gen.output, 220)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
