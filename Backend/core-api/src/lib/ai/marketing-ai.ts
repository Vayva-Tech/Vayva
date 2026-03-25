import { urls, logger } from "@vayva/shared";

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
  static async getResponse(messages: any) {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        logger.warn("[MarketingAI] No OpenRouter API key found");
        return {
          success: false,
          message: "AI service temporarily unavailable.",
        };
      }
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva Marketing",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-001",
          messages: [
            { role: "system", content: this.SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
      
      const data = await response.json();

      return {
        success: true,
        message:
          data.choices[0]?.message?.content ||
          "I'm sorry, I couldn't process that right now. Please try again or contact our support team.",
      };
    } catch (error) {
      logger.error("Marketing AI Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        message:
          "I'm having a bit of trouble connecting to my brain right now. Please refresh or try again in a moment!",
      };
    }
  }
}
