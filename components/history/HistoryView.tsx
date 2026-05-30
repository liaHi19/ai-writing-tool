"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { MODES } from "@/lib/constants";
import type { Generation } from "@/lib/history";
import { type Mode } from "@/lib/prompts";
import { HistoryCard } from "./HistoryCard";
import {
  HistoryToolbar,
  type HistoryCounts,
  type HistoryFilter,
} from "./HistoryToolbar";

export function HistoryView({ generations }: { generations: Generation[] }) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const counts = useMemo<HistoryCounts>(() => {
    const seed = { all: generations.length } as HistoryCounts;
    for (const m of MODES) seed[m] = 0;
    for (const g of generations) {
      if ((MODES as readonly string[]).includes(g.mode)) {
        seed[g.mode as Mode]++;
      }
    }
    return seed;
  }, [generations]);

  const visible = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return generations.filter((g) => {
      if (filter !== "all" && g.mode !== filter) return false;
      if (!q) return true;
      return (
        g.input.toLowerCase().includes(q) ||
        g.output.toLowerCase().includes(q)
      );
    });
  }, [generations, filter, debouncedQuery]);

  if (generations.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <HistoryToolbar
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />
      {visible.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="rounded-(--radius) border border-dashed bg-(--surface) px-10 py-8 text-center">
            <p className="text-sm text-(--fg-muted)">No matches.</p>
            <p className="mt-1 text-xs text-(--fg-dim)">
              Try a different mode or search term.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((gen) => (
            <HistoryCard key={gen.id} gen={gen} />
          ))}
        </div>
      )}
    </div>
  );
}
