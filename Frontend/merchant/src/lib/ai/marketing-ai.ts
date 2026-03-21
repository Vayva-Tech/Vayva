import { urls, logger } from "@vayva/shared";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_MARKETING_KEY || "",
});

export class MarketingAIService {
    static SYSTEM_PROMPT = `You are Vayva AI, a friendly and polished assistant for Vayva. 
Your goal is to help visitors understand how Vayva transforms "messy WhatsApp selling" into a "premium organized business."

Personality:
- Warm, professional, and very human-like.
- Keep responses short and helpful (max 2-3 sentences).
- Use a helpful, "can-do" Nigerian business tone.

Key Facts to drop naturally:
1. "WhatsApp is for chat, Vayva is for business."
2. We auto-capture orders from chat so you don't have to.
3. We handle payments via Paystack and keep your inventory perfect.
4. You can start for FREE right now with no credit card.

If they seem ready, kindly invite them to click "Start selling for free." If you don't know something, just say: "That's a great question! Our human team at ${urls.supportEmail()} can give you the exact details on that."`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async getResponse(messages: any[]) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: this.SYSTEM_PROMPT },
                    ...messages,
                ],
                model: process.env.AI_MODEL || "llama-3.1-70b-versatile",
                temperature: 0.7,
                max_tokens: 1024,
            });

            return {
                success: true,
                message: completion.choices[0]?.message?.content ||
                    "I'm sorry, I couldn't process that right now. Please try again or contact our support team.",
            };
        }
        catch (error) {
            logger.error("Marketing AI Error:", { error: error instanceof Error ? error.message : String(error) });
            return {
                success: false,
                message: "I'm having a bit of trouble connecting to my brain right now. Please refresh or try again in a moment!",
            };
        }
    }
}
