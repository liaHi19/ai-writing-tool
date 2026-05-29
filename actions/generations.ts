"use server";

import { refresh, updateTag } from "next/cache";

import { MODEL_ID } from "@/lib/anthropic";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import {
  saveGenerationSchema,
  type SaveGenerationInput,
} from "@/lib/validation/generate";

export type SaveGenerationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function saveGeneration(
  input: SaveGenerationInput,
): Promise<SaveGenerationResult> {
  const parsed = saveGenerationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid request",
    };
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      mode: parsed.data.mode,
      input: parsed.data.input,
      output: parsed.data.output,
      model: MODEL_ID,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to persist generation:", error);
    return { ok: false, error: "Failed to save" };
  }

  updateTag(`history:${user.id}`);
  refresh();

  return { ok: true, id: data.id };
}

export type DeleteGenerationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteGeneration(
  id: string,
): Promise<DeleteGenerationResult> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("generations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: "Not found" };

  updateTag(`history:${user.id}`);
  refresh();
  return { ok: true };
}

export type ClearAllGenerationsResult =
  | { ok: true; deleted: number }
  | { ok: false; error: string };

export async function clearAllGenerations(): Promise<ClearAllGenerationsResult> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("generations")
    .delete()
    .eq("user_id", user.id)
    .select("id");

  if (error) return { ok: false, error: error.message };

  updateTag(`history:${user.id}`);
  refresh();
  return { ok: true, deleted: data?.length ?? 0 };
}
