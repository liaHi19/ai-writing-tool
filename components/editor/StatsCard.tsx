"use client";

import { useWatch, type Control } from "react-hook-form";
import { type GenerateInput } from "@/lib/validation/generate";
import { countChars, countWords } from "@/lib/helpers";

interface StatsCardProps {
  control: Control<GenerateInput>;
}

export function StatsCard({ control }: StatsCardProps) {
  const text = useWatch({ control, name: "text" }) ?? "";

  const words = countWords(text);
  const chars = countChars(text);
  const read = Math.max(1, Math.round(words / 220));

  return (
    <section className="flex h-full flex-col rounded-(--radius) border border-border bg-(--surface) p-[22px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--fg-muted)">
          At a glance
        </span>
        <span className="font-mono text-[11px] text-(--fg-dim)">live</span>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2.5">
        <Stat value={words} label="words" />
        <Stat value={chars} label="chars" />
        <Stat value={read} unit="m" label="read" />
      </div>
    </section>
  );
}

function Stat({
  value,
  unit,
  label,
}: {
  value: number;
  unit?: string;
  label: string;
}) {
  return (
    <div className="rounded-(--radius-sm) bg-(--surface-2) px-3.5 pt-3.5 pb-3">
      <div className="font-mono text-[22px] font-medium leading-none tracking-[-0.02em] tabular-nums text-(--fg)">
        {value}
        {unit && (
          <span className="ml-0.5 text-[12px] text-(--fg-muted)">{unit}</span>
        )}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-(--fg-muted)">
        {label}
      </div>
    </div>
  );
}
