import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@vayva/redis";
import { openRouterChatCompletion } from "@/lib/openrouter";

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

async function checkIpRateLimit(ip: string): Promise<boolean> {
  const redis = await getRedis();
  const key = `rate_limit:marketing_ai:${ip}`;
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.pexpire(key, WINDOW_MS);
  }
  
  return current <= RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!(await checkIpRateLimit(ip))) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    const { messages } = await req.json();

    const message = await openRouterChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are Vayva AI, a helpful assistant for Vayva, a WhatsApp-based business platform for Nigerian merchants. Your goal is to explain Vayva's features (automated orders, payments, inventory, delivery) and encourage users to sign up. Be concise, friendly, and professional. Keep answers under 3 sentences.",
        },
        ...messages,
      ],
      model: "openai/gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 150,
    });

    return NextResponse.json({
      success: true,
      message: message || "I didn't catch that.",
    });
  } catch (error: unknown) {
    console.error("Marketing AI Error:", error);
    return NextResponse.json({
      success: false,
      message: "Sorry, I'm having trouble connecting right now.",
    });
  }
}
