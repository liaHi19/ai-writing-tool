"use client";

import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";
import { z } from "zod";

import { generateSchema } from "@/lib/validation/generate";

// useCompletion posts { prompt, mode }; the route expects { text, mode }.
// mode is kept here (not stripped) so it survives into the renamed body;
// generateSchema does the real enum validation downstream.
const completionBodySchema = z.object({ prompt: z.string(), mode: z.string() });
const errorBodySchema = z.object({ error: z.string().optional() });

export function useGenerate() {
  return useCompletion({
    api: "/api/generate",
    // Route returns a plain text stream (toTextStreamResponse); match that here.
    streamProtocol: "text",
    // The route expects { text, mode }; useCompletion sends { prompt, ...body }.
    // We intercept here to rename prompt → text before the request goes out.
    fetch: async (url, init) => {
      const rawBody = typeof init?.body === "string" ? init.body : "{}";
      const { prompt, ...rest } = completionBodySchema.parse(
        JSON.parse(rawBody),
      );
      const response = await globalThis.fetch(url, {
        ...init,
        body: JSON.stringify(generateSchema.parse({ text: prompt, ...rest })),
      });
      if (!response.ok) {
        const data = await response
          .clone()
          .json()
          .catch(() => ({}));
        const { error } = errorBodySchema.parse(data);
        throw new Error(error ?? `Request failed (${response.status})`);
      }
      return response;
    },
    onError: (err) => toast.error(err.message),
  });
}
