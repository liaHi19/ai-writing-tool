"use client";

import { type Mode } from "@/lib/prompts";
import { generateDefaults } from "@/lib/validation/generate";
import { createContext, useContext, useMemo, useState } from "react";

type ModeContextValue = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(generateDefaults.mode);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <ModeContext value={value}>{children}</ModeContext>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return ctx;
}
