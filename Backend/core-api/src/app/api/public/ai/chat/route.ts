import { NextResponse } from "next/server";
import { MarketingAIService } from "@/lib/ai/marketing-ai";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }
    const result = await MarketingAIService.getResponse(messages);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("[PUBLIC_AI_CHAT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
