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
    <section className="flex h-full flex-col rounded-(--radius) border border-border bg-(--surface) p-5.5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-(--fg-muted)">
          Mode
        </span>
        <span className="font-mono text-[11px] text-(--fg-dim)">
          {MODES.length} presets
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
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
                "flex flex-col gap-2 rounded-sm border px-2.5 pt-3.5 pb-3 text-left transition-colors",
                active
                  ? "border-(--fg) bg-(--fg) text-(--surface)"
                  : "border-transparent bg-(--surface-2) hover:bg-(--surface)",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.06em]",
                  active ? "text-(--surface-2) opacity-70" : "text-(--fg-dim)",
                )}
              >
                {idx}
              </span>
              <span className="text-sm font-medium tracking-[-0.01em]">
                {name}
              </span>
              <span
                className={cn(
                  "font-mono text-[11px] leading-[1.35]",
                  active
                    ? "text-(--surface-2) opacity-70"
                    : "text-(--fg-muted)",
                )}
              >
                {description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
