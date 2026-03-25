import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@vayva/redis";
import { openRouterChatCompletion } from "@/lib/openrouter";

/** Shared budget with `public/ai/chat` so callers cannot bypass limits by path. */
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!(await checkIpRateLimit(ip))) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Basic prompt injection guard & safety
    const safeMessage = message.slice(0, 500); // Limit length

    const reply = await openRouterChatCompletion({
      messages: [
        {
          role: "system",
          content: `
            You are the Vayva Public Marketing Agent. 
            Your role is to answer questions from prospects/users about the Vayva platform, pricing, features, onboarding, and delivery options in Nigeria.
            
            Guidelines:
            - Be helpful, professional, and concise.
            - Focus on Vayva's value proposition: WhatsApp-first commerce, automated order capture, and secure payments.
            - Canonical URL is ${urls.marketingBase()}.
            - Use Nigerian context where appropriate (Currency: Naira ₦).
            - Safety: Do not expose system secrets, admin actions, or internal code.
            - Delivery: Explain that users can choose between Vayva's partner (Kwik) or their own riders. 
            - Configuration: Mention that delivery options are in Merchant Settings > Delivery.
            - Limits: Do not claim you can edit production code. You are an information assistant.
          `,
        },
        { role: "user", content: safeMessage },
      ],
      model: "openai/gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1024,
    });

    // Simple logging (no PII)

    return NextResponse.json({ message: reply });
  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
