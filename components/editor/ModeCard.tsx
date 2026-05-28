"use client";

import { MODES, MODE_META } from "@/lib/constants";
import { type Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  value: Mode;
  onChange: (value: Mode) => void;
  disabled?: boolean;
}

export function ModeCard({ value, onChange, disabled }: ModeCardProps) {
  return (
    <div className="flex flex-col gap-2">
      {MODES.map((mode, i) => {
        const active = value === mode;
        const idx = String(i + 1).padStart(2, "0");
        const { name, description } = MODE_META[mode];
        return (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode)}
            className={cn(
              "relative w-full rounded-sm p-4 text-left transition-colors",
              active
                ? "bg-(--fg) text-(--accent-fg)"
                : "bg-(--surface) text-(--fg) border border-border hover:bg-(--surface-2)",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {active && (
              <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent" />
            )}
            <span className="block font-mono text-xs opacity-50">{idx}</span>
            <span className="mt-1 block font-medium">{name}</span>
            <span
              className={cn(
                "mt-0.5 block text-sm",
                active ? "opacity-60" : "text-(--fg-muted)",
              )}
            >
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
