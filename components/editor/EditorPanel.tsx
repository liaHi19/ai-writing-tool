"use client";

import { useCallback, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";

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
import { DraftCard } from "./DraftCard";
import { ModeCard } from "./ModeCard";
import { OutputPane } from "./OutputPane";
import { StatsCard } from "./StatsCard";

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

  const onValid = useCallback(
    (data: GenerateInput) => {
      if (isLoading) return;
      complete(data.text, { body: { mode: data.mode } });
    },
    [isLoading, complete],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        form.handleSubmit(onValid)();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, onValid]);

  return (
    <div className="min-h-screen bg-(--bg) p-6">
      <div className="mx-auto max-w-6xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Mode selector — col-span-7 */}
              <div className="col-span-7">
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ModeCard
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Stats — col-span-5 */}
              <div className="col-span-5">
                <StatsCard control={form.control} />
              </div>

              {/* Draft — col-span-12 */}
              <div className="col-span-12">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DraftCard
                          value={field.value}
                          onChange={field.onChange}
                          control={form.control}
                          onClear={() =>
                            form.setValue("text", "", {
                              shouldValidate: true,
                            })
                          }
                          isLoading={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Output — col-span-12, todo 23 */}
              <div className="col-span-12 space-y-2">
                <OutputPane content={completion} isLoading={isLoading} />
                <div className="flex justify-end">
                  <CopyButton text={completion} disabled={!completion} />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
