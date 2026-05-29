"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteGeneration } from "@/actions/generations";
import { CopyButton } from "@/components/editor/CopyButton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Tables } from "@/lib/db/types";
import {
  countChars,
  countWords,
  formatDate,
  formatRelativeTime,
  truncate,
} from "@/lib/helpers";

type Generation = Tables<"generations">;

export function HistoryCard({ gen }: { gen: Generation }) {
  const chars = countChars(gen.output);
  const words = countWords(gen.output);

  async function handleDelete() {
    const result = await deleteGeneration(gen.id);
    if (!result.ok) {
      toast.error(`Failed to delete: ${result.error}`);
    }
  }

  return (
    <article className="group relative flex min-h-55 flex-col gap-3 rounded-(--radius) border bg-(--surface) p-4.5 transition-colors hover:border-(--fg-muted)">
      <ConfirmDialog
        trigger={
          <button
            aria-label="Delete generation"
            title="Delete entry"
            className="absolute right-2 top-3 grid size-7 place-items-center rounded-full text-(--fg-dim) opacity-45 transition-[opacity,background-color,color] hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        }
        icon={<Trash2 size={20} />}
        title="Delete this generation?"
        description={
          <span className="line-clamp-2 font-mono text-[11px] leading-relaxed">
            &ldquo;{truncate(gen.input, 120)}&rdquo;
          </span>
        }
        onConfirm={handleDelete}
        confirmLabel="Delete"
      />

      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--surface-2) px-2.25 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg)">
          <span className="size-1.5 rounded-full bg-accent" />
          {gen.mode}
        </span>
        <div className="flex flex-col items-end gap-0.5 pr-5.5 text-right">
          <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.02em] text-(--fg-muted)">
            {formatDate(gen.created_at)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-(--fg-dim)">
            {formatRelativeTime(gen.created_at)}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 border-l-2 border-border pl-2.5 font-mono text-[11px] leading-[1.45] text-(--fg-dim)">
        {gen.input}
      </p>

      <p className="line-clamp-7 flex-1 whitespace-pre-wrap text-sm leading-[1.55] text-(--fg)">
        {gen.output}
      </p>

      <div className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg-dim)">
          {chars.toLocaleString()} ch · {words.toLocaleString()} w
        </span>
        <CopyButton text={gen.output} />
      </div>
    </article>
  );
}
