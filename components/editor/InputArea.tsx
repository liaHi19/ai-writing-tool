"use client";

import { Textarea } from "@/components/ui/textarea";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function InputArea({ value, onChange, disabled }: InputAreaProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste your text here…"
      className="min-h-40 resize-y"
      disabled={disabled}
    />
  );
}
