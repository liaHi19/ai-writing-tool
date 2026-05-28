"use client";

import { useWatch, type Control } from "react-hook-form";
import { type GenerateInput } from "@/lib/validation/generate";

interface StatsCardProps {
  control: Control<GenerateInput>;
}

export function StatsCard({ control }: StatsCardProps) {
  const text = useWatch({ control, name: "text" }) ?? "";

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const readTime = Math.max(1, Math.round(words / 220));

  return (
    <div className="h-full bg-(--surface) rounded-radius border border-border p-4 flex flex-col gap-6">
      <Stat label="Words" value={words} />
      <Stat label="Characters" value={chars} />
      <Stat label="Read time" value={readTime} unit="min" />
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <div>
      <p className="text-xs text-(--fg-muted) uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-(--fg) tabular-nums">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-(--fg-muted)">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
