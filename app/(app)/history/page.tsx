import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { fetchGenerationsByUserId } from "@/lib/supabase/server-admin";
import { createClient } from "@/lib/supabase/server";
import { CopyButton } from "@/components/editor/CopyButton";
import type { Tables } from "@/lib/db/types";

type Generation = Tables<"generations">;

// Cache boundary around the privileged query. userId is the cache-key
// discriminator; invalidated by revalidateTag(`history:${userId}`) in
// /api/generate onFinish.
async function fetchHistory(userId: string): Promise<Generation[]> {
  "use cache";
  cacheTag(`history:${userId}`);
  cacheLife("hours");

  return fetchGenerationsByUserId(userId);
}

function truncate(text: string, maxLen: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= maxLen ? flat : flat.slice(0, maxLen) + "…";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Dynamic — reads auth cookies. Lives inside <Suspense> so the static shell
// can prerender under cacheComponents.
async function HistoryList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            <time
              dateTime={gen.created_at}
              className="text-xs text-zinc-400"
            >
              {formatDate(gen.created_at)}
            </time>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Input
            </p>
            <p className="text-sm text-zinc-700">
              {truncate(gen.input, 220)}
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Output
              </p>
              <CopyButton text={gen.output} />
            </div>
            <p className="text-sm text-zinc-700">
              {truncate(gen.output, 220)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HistoryListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="h-32 animate-pulse rounded-lg border bg-white p-4 shadow-sm"
        />
      ))}
    </ul>
  );
}

export default function HistoryPage() {
  return (
    <div className="bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your past AI generations, newest first.
          </p>
        </div>

        <Suspense fallback={<HistoryListSkeleton />}>
          <HistoryList />
        </Suspense>
      </div>
    </div>
  );
}
