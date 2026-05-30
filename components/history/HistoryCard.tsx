"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteGeneration, updateGeneration } from "@/actions/generations";
import { CopyButton } from "@/components/editor/CopyButton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  const [open, setOpen] = useState(false);
  const [editedOutput, setEditedOutput] = useState(gen.output);
  const [saving, setSaving] = useState(false);

  const chars = countChars(gen.output);
  const words = countWords(gen.output);

  const isDirty = editedOutput !== gen.output;
  const saveDisabled = !isDirty || !editedOutput.trim() || saving;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setEditedOutput(gen.output);
  }

  function handleCardKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  async function handleDelete() {
    const result = await deleteGeneration(gen.id);
    if (!result.ok) {
      toast.error(`Failed to delete: ${result.error}`);
    }
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateGeneration(gen.id, editedOutput);
    setSaving(false);
    if (!result.ok) {
      toast.error(`Failed to save: ${result.error}`);
    } else {
      toast.success("Saved");
      setOpen(false);
    }
  }

  return (
    <>
      <article className="group relative flex min-h-55 flex-col gap-3 rounded-(--radius) border bg-(--surface) p-4.5 transition-colors hover:border-(--fg-muted)">
        {/* action cluster — stopPropagation so clicks don't bubble to the card open handler */}
        <div
          className="absolute right-2 top-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <ConfirmDialog
            trigger={
              <button
                aria-label="Delete generation"
                title="Delete entry"
                className="grid size-7 place-items-center rounded-full text-(--fg-dim) opacity-45 transition-[opacity,background-color,color] hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
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
        </div>

        {/* clickable card body */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open generation detail"
          className="flex flex-1 cursor-pointer flex-col gap-3 outline-none"
          onClick={() => setOpen(true)}
          onKeyDown={handleCardKeyDown}
        >
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

          <div
            className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-2.5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg-dim)">
              {chars.toLocaleString()} ch · {words.toLocaleString()} w
            </span>
            <CopyButton text={gen.output} />
          </div>
        </div>
      </article>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-4 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--surface-2) px-2.25 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg)">
                <span className="size-1.5 rounded-full bg-accent" />
                {gen.mode}
              </span>
              <span className="font-mono text-[11px] text-(--fg-muted)">
                {formatDate(gen.created_at)} · {formatRelativeTime(gen.created_at)}
              </span>
            </div>
            <DialogTitle className="sr-only">Generation detail</DialogTitle>
          </DialogHeader>

          <p className="shrink-0 border-l-2 border-border pl-2.5 font-mono text-[11px] leading-[1.45] text-(--fg-dim) line-clamp-3">
            {gen.input}
          </p>

          <Textarea
            value={editedOutput}
            onChange={(e) => setEditedOutput(e.target.value)}
            className="min-h-60 flex-1 resize-none font-mono text-sm leading-[1.55]"
            aria-label="Edit output"
          />

          <div className="flex shrink-0 items-center justify-between gap-2">
            <CopyButton text={editedOutput} disabled={!editedOutput.trim()} />
            <Button onClick={handleSave} disabled={saveDisabled}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
