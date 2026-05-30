"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useGenerate } from "@/hooks/useGenerate";
import {
  generateDefaults,
  generateSchema,
  type GenerateInput,
} from "@/lib/validation/generate";
import { useMode } from "@/providers/ModeProvider";
import { DraftCard } from "./DraftCard";
import { ModeCard } from "./ModeCard";
import { OutputCard } from "./OutputCard";
import { StatsCard } from "./StatsCard";

export function EditorPanel() {
  const form = useForm<GenerateInput>({
    resolver: standardSchemaResolver(generateSchema),
    defaultValues: generateDefaults,
    mode: "onTouched",
  });

  const { completion, isLoading, complete, setCompletion, stop } =
    useGenerate();

  const { setMode } = useMode();
  const selectedMode = useWatch({ control: form.control, name: "mode" });

  useEffect(() => {
    setMode(selectedMode);
  }, [selectedMode, setMode]);

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
    <div className="min-h-screen bg-(--bg) py-6">
      <div className="container max-w-6xl">
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
                          onClear={() => {
                            if (isLoading) {
                              stop();
                              toast.info("Generation cancelled");
                            }
                            form.setValue("text", "");
                            form.clearErrors("text");
                            setCompletion("");
                          }}
                          isLoading={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Output — col-span-12 */}
              <div className="col-span-12">
                <OutputCard
                  completion={completion}
                  isLoading={isLoading}
                  control={form.control}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
