"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODE_LABELS, MODES } from "@/lib/constants";
import { type Mode } from "@/lib/prompts";

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
