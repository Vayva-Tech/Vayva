import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_MARKETING || process.env.GROQ_API_KEY || "",
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Basic prompt injection guard & safety
    const safeMessage = message.slice(0, 500); // Limit length

    const completion = await groq.chat.completions.create({
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
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I apologize, but I couldn't process that request.";

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
