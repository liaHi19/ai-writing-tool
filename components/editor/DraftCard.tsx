"use client";

import { Sparkles } from "lucide-react";
import { useWatch, type Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useHint } from "@/hooks/useHint";
import { MODE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { type GenerateInput } from "@/lib/validation/generate";

const MAX_CHARS = 2400;
const ACCENT_THRESHOLD = 2112; // 88% of 2400

interface DraftCardProps {
  value: string;
  onChange: (value: string) => void;
  control: Control<GenerateInput>;
  onClear: () => void;
  isLoading: boolean;
}

export function DraftCard({
  value,
  onChange,
  control,
  onClear,
  isLoading,
}: DraftCardProps) {
  const hint = useHint();
  const mode = useWatch({ control, name: "mode" });

  const chars = value.length;
  const fillPct = Math.min(100, (chars / MAX_CHARS) * 100);
  const isNearLimit = chars >= ACCENT_THRESHOLD;
  const canSubmit = !isLoading && value.trim().length >= 10;
  const isDisabled = !value && !isLoading;

  return (
    <div className="bg-(--surface) border border-border rounded-(--radius) p-5.5 flex flex-col">
      {/* Card head — label left, actions right; stacks on mobile */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-(--fg-muted)">
          Draft
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 rounded-full px-4 sm:flex-none"
            onClick={onClear}
            disabled={isDisabled}
          >
            Clear
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1 rounded-full px-4 sm:flex-none"
            disabled={!canSubmit}
          >
            <Sparkles />
            {isLoading ? "Polishing…" : `Rewrite as ${MODE_META[mode].name}`}
          </Button>
        </div>
      </div>

      {/* Borderless textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Paste or write your draft. Pick a mode above, then rewrite."
        disabled={isLoading}
        rows={10}
        spellCheck
        className="w-full min-h-60 resize-none border-none bg-transparent p-0 text-base leading-[1.55] tracking-[-0.005em] text-(--fg) placeholder:text-(--fg-dim) outline-none"
      />

      {/* Foot — dashed top, counter+bar on left, hint on right */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-3.5">
        <div
          className={cn(
            "flex items-center gap-2.5 font-mono text-xs text-(--fg-muted)",
            isNearLimit && "text-accent",
          )}
        >
          <div className="h-1 w-20 overflow-hidden rounded-full bg-(--surface-2)">
            <div
              className="h-full transition-[width,background] duration-200"
              style={{
                width: `${fillPct}%`,
                backgroundColor: isNearLimit ? "var(--accent)" : "var(--fg)",
              }}
            />
          </div>
          <span>
            <b
              className={cn(
                "font-medium",
                isNearLimit ? "text-accent" : "text-(--fg)",
              )}
            >
              {chars.toLocaleString()}
            </b>{" "}
            / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-(--fg-dim)">
          {hint} to rewrite
        </span>
      </div>
    </div>
  );
}
