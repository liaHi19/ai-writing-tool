"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type Mode } from "@/lib/prompts";
import { CopyButton } from "./CopyButton";
import { InputArea } from "./InputArea";
import { ModeSelector } from "./ModeSelector";
import { OutputPane } from "./OutputPane";

export function EditorPanel() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<Mode>("improve");

  const { completion, isLoading, complete } = useCompletion({
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

  const handleGenerate = () => {
    if (!inputText.trim() || isLoading) return;
    // Pass mode as extra body so it arrives alongside the prompt in the route
    complete(inputText, { body: { mode } });
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Writing Tool</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Paste your text, pick a mode, and generate.
          </p>
        </div>

        <InputArea value={inputText} onChange={setInputText} disabled={isLoading} />

        <div className="flex items-center gap-3">
          <ModeSelector value={mode} onChange={setMode} disabled={isLoading} />
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? "Generating…" : "Generate"}
          </Button>
        </div>

        <div className="space-y-2">
          <OutputPane content={completion} isLoading={isLoading} />
          <div className="flex justify-end">
            <CopyButton text={completion} disabled={!completion} />
          </div>
        </div>
      </div>
    </div>
  );
}
