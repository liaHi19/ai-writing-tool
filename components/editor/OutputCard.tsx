"use client";

import { Check, Loader2, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";

import { saveGeneration } from "@/actions/generations";
import { CopyButton } from "@/components/editor/CopyButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MODE_META } from "@/lib/constants";
import { countChars, countWords } from "@/lib/helpers";
import { type Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { type GenerateInput } from "@/lib/validation/generate";

interface OutputCardProps {
  completion: string;
  isLoading: boolean;
  control: Control<GenerateInput>;
}

export function OutputCard({
  completion,
  isLoading,
  control,
}: OutputCardProps) {
  const mode = useWatch({ control, name: "mode" }) as Mode;
  const input = useWatch({ control, name: "text" }) ?? "";

  const [savedCompletion, setSavedCompletion] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editedOutput, setEditedOutput] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Adjusting state during render (React-recommended pattern for prop-driven resets)
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading);
  const [prevCompletion, setPrevCompletion] = useState(completion);

  if (prevIsLoading !== isLoading) {
    setPrevIsLoading(isLoading);
    if (isLoading) {
      setEditedOutput(null);
      setIsEditing(false);
    }
  }

  if (prevCompletion !== completion) {
    setPrevCompletion(completion);
    if (!completion) {
      setEditedOutput(null);
      setIsEditing(false);
    }
  }

  const displayedText = editedOutput ?? completion;

  const saved = !!displayedText && savedCompletion === displayedText;

  const isEmpty = !displayedText && !isLoading;
  const chars = countChars(displayedText);
  const words = countWords(displayedText);
  const modeName = MODE_META[mode].name;

  async function handleSave() {
    setSaving(true);
    const result = await saveGeneration({ mode, input, output: displayedText });
    setSaving(false);
    if (result.ok) {
      setSavedCompletion(displayedText);
      toast.success("Saved to history");
    } else {
      toast.error(result.error);
    }
  }

  function handleEditToggle() {
    if (isEditing) {
      // Cancel: discard edits and return to the original output
      setEditedOutput(null);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }

  const canEdit = !!completion && !isLoading;
  const saveDisabled = !displayedText || isLoading || saving || saved;

  return (
    <div className="bg-(--surface) border border-border rounded-(--radius) p-5.5 flex flex-col">
      {/* Card head — "Output · {mode}" label + Copy/Save actions; stacks on mobile */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-(--fg-muted)">
          {isEditing ? "Editing · " : "Output · "}
          {modeName}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-full px-4 sm:flex-none",
              isEditing && "bg-(--fg)/8",
            )}
            aria-pressed={isEditing}
            aria-label={isEditing ? "Cancel editing" : "Edit output"}
            disabled={!canEdit}
            onClick={handleEditToggle}
          >
            {isEditing ? <X /> : <Pencil />}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <CopyButton
            text={displayedText}
            className="flex-1 rounded-full px-4 sm:flex-none"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-full px-4 sm:flex-none"
            onClick={handleSave}
            disabled={saveDisabled}
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : saved ? (
              <Check />
            ) : (
              <Save />
            )}
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* Inset body */}
      {isEditing ? (
        <Textarea
          data-output-editor="true"
          value={displayedText}
          onChange={(e) => setEditedOutput(e.target.value)}
          aria-label="Edit output"
          autoFocus
          spellCheck
          className="min-h-40 resize-none rounded-sm border border-ring/30 bg-(--surface-2) px-5.5 py-5 text-[15px] leading-[1.6] text-(--fg) focus-visible:ring-2 focus-visible:border-ring"
        />
      ) : (
        <div className="min-h-40 rounded-sm bg-(--surface-2) px-5.5 py-5 text-[15px] leading-[1.6] text-(--fg) whitespace-pre-wrap">
          {displayedText ? (
            <>
              {displayedText}
              {isLoading && (
                <span className="ml-px inline-block h-[1em] w-0.5 animate-pulse bg-(--fg-muted) align-middle" />
              )}
            </>
          ) : (
            <div className="flex items-center gap-2.5 font-mono text-xs tracking-[0.02em] text-(--fg-dim)">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isLoading ? "bg-accent animate-pulse" : "bg-(--fg-dim)",
                )}
              />
              {isLoading
                ? "polishing your draft…"
                : "your rewrite will appear here"}
            </div>
          )}
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-(--fg-dim)">
        <span>{isEmpty ? "—" : `${chars} chars · ${words} words`}</span>
        <span>{mode} · auto</span>
      </div>
    </div>
  );
}
