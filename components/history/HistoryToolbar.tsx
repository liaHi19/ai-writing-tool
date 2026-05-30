"use client";

import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { clearAllGenerations } from "@/actions/generations";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MODES, MODE_LABELS } from "@/lib/constants";
import { type Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";

export type HistoryFilter = Mode | "all";
export type HistoryCounts = Record<HistoryFilter, number>;

interface HistoryToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: HistoryFilter;
  onFilterChange: (f: HistoryFilter) => void;
  counts: HistoryCounts;
}

export function HistoryToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
}: HistoryToolbarProps) {
  async function handleClearAll() {
    const result = await clearAllGenerations();
    if (result.ok) {
      toast.success(`Deleted ${result.deleted} generations`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative max-w-90 flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--fg-dim)"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search generations…"
          className="w-full rounded-full border border-border bg-(--surface) py-2.25 pl-9 pr-3.5 font-mono text-[13px] text-(--fg) placeholder:text-(--fg-dim) outline-none transition-colors focus:border-(--fg-muted)"
        />
      </div>

      <div className="inline-flex gap-0.5 rounded-full border border-border bg-(--surface) p-1">
        <FilterChip
          active={filter === "all"}
          onClick={() => onFilterChange("all")}
          label="All"
          count={counts.all}
        />
        {MODES.map((m) => (
          <FilterChip
            key={m}
            active={filter === m}
            onClick={() => onFilterChange(m)}
            label={MODE_LABELS[m]}
            count={counts[m]}
          />
        ))}
      </div>

      <ConfirmDialog
        trigger={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg-muted) transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={13} />
            Clear all
          </button>
        }
        icon={<Trash2 size={20} />}
        title="Delete all generations?"
        description="This can't be undone."
        onConfirm={handleClearAll}
        confirmLabel="Delete all"
      />
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

function FilterChip({ active, onClick, label, count }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
        active
          ? "bg-(--fg) text-(--surface)"
          : "text-(--fg-muted) hover:text-(--fg)",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          active ? "opacity-70" : "text-(--fg-dim)",
        )}
      >
        ({count})
      </span>
    </button>
  );
}
