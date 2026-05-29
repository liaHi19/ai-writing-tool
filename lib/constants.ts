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

export const MODE_META: Record<Mode, { name: string; description: string }> = {
  improve: { name: "Improve", description: "Clarity + flow" },
  email: { name: "Email", description: "Polite, structured" },
  linkedin: {
    name: "LinkedIn",
    description: "Public, narrative",
  },
  technical: {
    name: "Technical",
    description: "Precise, no fluff",
  },
  casual: { name: "Casual", description: "Friendly, light" },
};

export const HEADER_ICONS = {
  write:
    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
  history: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  signout:
    "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
};
