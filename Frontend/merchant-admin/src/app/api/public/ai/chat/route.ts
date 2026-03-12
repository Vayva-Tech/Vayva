import { NextResponse } from "next/server";
import { MarketingAIService } from "@/lib/ai/marketing-ai";
import { logger } from "@/lib/logger";
export async function POST(request: Request) {
    try {
        const { messages } = await request.json();
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
        }
        const result = await MarketingAIService.getResponse(messages);
        return NextResponse.json(result);
    }
    catch (error) {
        logger.error("[MARKETING_AI_CHAT] Failed to process chat request", { error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
