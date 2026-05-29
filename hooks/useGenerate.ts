"use client";

import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";

export function useGenerate() {
  return useCompletion({
    api: "/api/generate",
    // Route returns a plain text stream (toTextStreamResponse); match that here.
    streamProtocol: "text",
    // The route expects { text, mode }; useCompletion sends { prompt, ...body }.
    // We intercept here to rename prompt → text before the request goes out.
    fetch: async (url, init) => {
      const raw = JSON.parse((init?.body as string) ?? "{}") as {
        prompt?: string;
        [key: string]: unknown;
      };
      const { prompt, ...rest } = raw;
      const response = await globalThis.fetch(url, {
        ...init,
        body: JSON.stringify({ text: prompt, ...rest }),
      });
      if (!response.ok) {
        const data = (await response.clone().json()) as { error?: string };
        throw new Error(data.error ?? `Request failed (${response.status})`);
      }
      return response;
    },
    onError: (err) => toast.error(err.message),
  });
}
