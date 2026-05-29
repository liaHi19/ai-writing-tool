import { streamText } from "ai";
import { NextResponse } from "next/server";

import { anthropic, MODEL_ID } from "@/lib/anthropic";
import { PROMPTS } from "@/lib/prompts";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { generateSchema } from "@/lib/validation/generate";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();

  if (!user) return errorResponse("Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? "Invalid request",
      400,
    );
  }
  const { text, mode } = parsed.data;

  const rate = await checkRateLimit(user.id);
  if (!rate.ok) {
    return errorResponse(
      `Daily limit of ${rate.limit} generations reached`,
      429,
    );
  }

  const userId = user.id;

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: PROMPTS[mode],
    prompt: text,
    onFinish: async () => {
      try {
        await incrementUsage(userId);
      } catch (err) {
        console.error("Failed to increment usage:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
