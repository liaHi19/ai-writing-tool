"use client";

import { useCompletion } from "@ai-sdk/react";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  generateDefaults,
  generateSchema,
  type GenerateInput,
} from "@/lib/validation/generate";
import { CopyButton } from "./CopyButton";
import { InputArea } from "./InputArea";
import { ModeSelector } from "./ModeSelector";
import { OutputPane } from "./OutputPane";

export function EditorPanel() {
  const form = useForm<GenerateInput>({
    resolver: standardSchemaResolver(generateSchema),
    defaultValues: generateDefaults,
    mode: "onTouched",
  });

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

  const onValid = (data: GenerateInput) => {
    if (isLoading) return;
    complete(data.text, { body: { mode: data.mode } });
  };

  const text = useWatch({ control: form.control, name: "text" });
  const canSubmit = !isLoading && text.trim().length >= 10;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Writing Tool</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Paste your text, pick a mode, and generate.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputArea
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ModeSelector
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!canSubmit}>
                {isLoading ? "Generating…" : "Generate"}
              </Button>
            </div>
          </form>
        </Form>

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
