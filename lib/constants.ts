import { Mode } from "./prompts";

export const MODES = [
  "improve",
  "email",
  "linkedin",
  "technical",
  "casual",
] as const;

export const MODE_LABELS: Record<Mode, string> = {
  improve: "Improve",
  email: "Email",
  linkedin: "LinkedIn",
  technical: "Technical",
  casual: "Casual",
};
