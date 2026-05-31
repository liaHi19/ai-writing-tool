"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { updateGeneration } from "@/actions/generations";
import { CopyButton } from "@/components/editor/CopyButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/lib/db/types";
import { formatDate, formatRelativeTime } from "@/lib/helpers";

type Generation = Tables<"generations">;

interface GenerationDialogProps {
  gen: Generation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerationDialog({
  gen,
  open,
  onOpenChange,
}: GenerationDialogProps) {
  const [editedOutput, setEditedOutput] = useState(gen.output);
  const [prevGenOutput, setPrevGenOutput] = useState(gen.output);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Adjusting state during render (React-recommended pattern for prop-driven resets):
  // re-sync editedOutput when gen.output changes (e.g. after background revalidation)
  if (prevGenOutput !== gen.output) {
    setPrevGenOutput(gen.output);
    setEditedOutput(gen.output);
    setIsEditing(false);
  }

  const isDirty = editedOutput !== gen.output;
  const saveDisabled = !isDirty || !editedOutput.trim() || saving;

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setEditedOutput(gen.output);
      setIsEditing(false);
    }
  }

  function handleCancelEdit() {
    setEditedOutput(gen.output);
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateGeneration(gen.id, editedOutput);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
    } else {
      toast.success("Saved");
      handleOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-hidden sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--surface-2) px-2.25 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg)">
              <span className="size-1.5 rounded-full bg-accent" />
              {gen.mode}
            </span>
            <span className="font-mono text-[11px] text-(--fg-muted)">
              {formatDate(gen.created_at)} ·{" "}
              {formatRelativeTime(gen.created_at)}
            </span>
          </div>
          <DialogTitle className="sr-only">
            {gen.mode} generation from {formatDate(gen.created_at)}
          </DialogTitle>
        </DialogHeader>

        <p className="shrink-0 border-l-2 border-border pl-2.5 font-mono text-[11px] leading-[1.45] text-(--fg-dim) line-clamp-3">
          {gen.input}
        </p>

        {/* toolbar — Copy sits top-right, right before the output */}
        <div className="flex shrink-0 items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg-dim)">
            {isEditing ? "Editing" : "Output"}
          </span>
          <CopyButton text={editedOutput} disabled={!editedOutput.trim()} />
        </div>

        {isEditing ? (
          <Textarea
            value={editedOutput}
            onChange={(e) => setEditedOutput(e.target.value)}
            className="min-h-60 flex-1 resize-none font-mono text-sm leading-[1.55]"
            aria-label="Edit output"
            autoFocus
          />
        ) : (
          <div className="min-h-60 flex-1 overflow-y-auto whitespace-pre-wrap rounded-md bg-(--surface-2) px-4 py-3.5 font-mono text-sm leading-[1.55] text-(--fg)">
            {editedOutput}
          </div>
        )}

        <div className="flex shrink-0 items-center justify-between gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                className="min-w-24"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="min-w-24"
                onClick={handleSave}
                disabled={saveDisabled}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={() => setIsEditing(true)}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
