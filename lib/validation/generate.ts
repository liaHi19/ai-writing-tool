import { z } from "zod";
import { MODES } from "../constants";

export const generateSchema = z.object({
  text: z.string().trim().min(10, "Text must be at least 10 characters"),
  mode: z.enum(MODES),
});

export type GenerateInput = z.infer<typeof generateSchema>;

export const generateDefaults: GenerateInput = { text: "", mode: "improve" };
