"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Mode, PROMPTS } from "@/lib/prompts";

// Human-readable labels for each mode; derived from the Mode union — not a separate source of truth
const MODE_LABELS: Record<Mode, string> = {
  improve: "Improve",
  email: "Email",
  linkedin: "LinkedIn",
  technical: "Technical",
  casual: "Casual",
  translate: "Translate",
};

// The set of valid mode values, derived from PROMPTS keys (single source of truth)
const MODES = Object.keys(PROMPTS) as Mode[];

interface ModeSelectorProps {
  value: Mode;
  onChange: (value: Mode) => void;
  disabled?: boolean;
}

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as Mode)}
      disabled={disabled}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MODES.map((mode) => (
          <SelectItem key={mode} value={mode}>
            {MODE_LABELS[mode]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
