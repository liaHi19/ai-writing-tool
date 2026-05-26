import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";

export const MODEL_ID = "claude-sonnet-4-6" as const;

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
