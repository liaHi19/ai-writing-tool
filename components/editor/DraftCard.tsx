"use client";

import { Button } from "@/components/ui/button";
import { useHint } from "@/hooks/useHint";
import { MODE_META } from "@/lib/constants";
import { type GenerateInput } from "@/lib/validation/generate";
import { useWatch, type Control } from "react-hook-form";

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

  return (
    <div className="bg-(--surface) rounded-radius border border-border p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Paste your text here…"
        disabled={isLoading}
        rows={10}
        className="w-full min-h-70 bg-(--surface) text-(--fg) placeholder:text-(--fg-dim) resize-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 rounded-sm text-sm"
      />

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-(--surface-2) rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${fillPct}%`,
            backgroundColor: isNearLimit ? "var(--accent)" : "var(--fg)",
          }}
        />
      </div>

      {/* Count + hint */}
      <div className="mt-1.5 flex items-center justify-between text-xs font-mono">
        <span
          style={{ color: isNearLimit ? "var(--accent)" : "var(--fg-dim)" }}
        >
          {chars} / {MAX_CHARS}
        </span>
        <span className="text-(--fg-dim)">{hint} to rewrite</span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!value || isLoading}
        >
          Clear
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? "Rewriting…" : `Rewrite as ${MODE_META[mode].name}`}
        </Button>
      </div>
    </div>
  );
}
