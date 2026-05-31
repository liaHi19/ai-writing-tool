import { z } from "zod";
import { MODES } from "../constants";

export const generateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, "Text must be at least 10 characters")
    .max(2400, "Text cannot exceed 2,400 characters"),
  mode: z.enum(MODES),
});

export type GenerateInput = z.infer<typeof generateSchema>;

export const generateDefaults: GenerateInput = { text: "", mode: "improve" };

export const saveGenerationSchema = z.object({
  mode: z.enum(MODES),
  input: z.string().trim().min(1, "Input is required").max(2400),
  output: z.string().trim().min(1, "Output is required").max(16_000),
});

export type SaveGenerationInput = z.infer<typeof saveGenerationSchema>;

export const deleteGenerationSchema = z.object({
  id: z.uuid("Invalid generation id"),
});

export type DeleteGenerationInput = z.infer<typeof deleteGenerationSchema>;

export const updateGenerationSchema = z.object({
  id: z.uuid("Invalid generation id"),
  output: z.string().trim().min(1, "Output is required").max(16_000),
});

export type UpdateGenerationInput = z.infer<typeof updateGenerationSchema>;
