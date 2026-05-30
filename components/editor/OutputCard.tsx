"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useWatch, type Control } from "react-hook-form";

import { saveGeneration } from "@/actions/generations";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/editor/CopyButton";
import { MODE_META } from "@/lib/constants";
import { countChars, countWords } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { type Mode } from "@/lib/prompts";
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

  const saved = !!completion && savedCompletion === completion;

  const isEmpty = !completion && !isLoading;
  const chars = countChars(completion);
  const words = countWords(completion);
  const modeName = MODE_META[mode].name;

  async function handleSave() {
    setSaving(true);
    const result = await saveGeneration({ mode, input, output: completion });
    setSaving(false);
    if (result.ok) {
      setSavedCompletion(completion);
      toast.success("Saved to history");
    } else {
      toast.error(result.error);
    }
  }

  const saveDisabled = !completion || isLoading || saving || saved;

  return (
    <div className="bg-(--surface) border border-border rounded-(--radius) p-5.5 flex flex-col">
      {/* Card head — "Output · {mode}" label + Copy/Save actions; stacks on mobile */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-(--fg-muted)">
          Output · {modeName}
        </span>
        <div className="flex items-center gap-1.5">
          <CopyButton
            text={completion}
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
      <div className="min-h-40 rounded-sm bg-(--surface-2) px-5.5 py-5 text-[15px] leading-[1.6] text-(--fg) whitespace-pre-wrap">
        {completion ? (
          <>
            {completion}
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

      {/* Foot — chars/words left, mode · auto right */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-(--fg-dim)">
        <span>{isEmpty ? "—" : `${chars} chars · ${words} words`}</span>
        <span>{mode} · auto</span>
      </div>
    </div>
  );
}
