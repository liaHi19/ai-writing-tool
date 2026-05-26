import { streamText } from "ai";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { anthropic, MODEL_ID } from "@/lib/anthropic";
import { PROMPTS, type Mode } from "@/lib/prompts";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && value in PROMPTS;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return errorResponse("Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const { text, mode } = (body ?? {}) as { text?: unknown; mode?: unknown };

  if (typeof text !== "string" || text.length === 0) {
    return errorResponse("Missing or invalid `text`", 400);
  }
  if (!isMode(mode)) {
    return errorResponse("Unknown mode", 400);
  }

  const rate = await checkRateLimit(user.id);
  if (!rate.ok) {
    return errorResponse(
      `Daily limit of ${rate.limit} generations reached`,
      429,
    );
  }

  const userId = user.id;
  const input = text;
  const selectedMode = mode;

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: PROMPTS[selectedMode],
    prompt: input,
    onFinish: async ({ text: output }) => {
      const { error: insertError } = await supabase.from("generations").insert({
        user_id: userId,
        mode: selectedMode,
        input,
        output,
        model: MODEL_ID,
      });
      if (insertError) {
        console.error("Failed to persist generation:", insertError);
        return;
      }

      try {
        await incrementUsage(userId);
      } catch (err) {
        console.error("Failed to increment usage:", err);
      }

      revalidateTag(`history:${userId}`, "hours");
    },
  });

  return result.toUIMessageStreamResponse();
}
