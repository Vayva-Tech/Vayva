import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";
import { AICreditService } from "./credit-service";
// Regex to identify potential emails and phone numbers for stripping
const PII_REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3,4}[-.]?\d{4}/g,
  CARD: /\b(?:\d[ -]*?){13,16}\b/g, // Simplified card-like pattern
};
export class GroqClient {
  context: string;
  apiKey: string | null;
  
  constructor(context: string = "MERCHANT") {
    this.context = context;
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    
    if (!this.apiKey) {
      logger.warn(
        `[GroqClient/OpenRouter] No API key found for ${context} context. AI features will fallback.`,
      );
    }
  }
  /**
   * Strip PII from input text
   */
  sanitizeInput(text: string) {
    return text
      .replace(PII_REGEX.EMAIL, "[REDACTED_EMAIL]")
      .replace(PII_REGEX.PHONE, "[REDACTED_PHONE]")
      .replace(PII_REGEX.CARD, "[REDACTED_SENSITIVE]");
  }
  /**
   * Generate a completion with safe handling
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string | null }>,
    options: Record<string, unknown> = {},
  ) {
    if (!this.apiKey) {
      logger.warn("[GroqClient/OpenRouter] Call skipped due to missing API key");
      return null;
    }
    
    try {
      // 1. Sanitize user messages
      const safeMessages = messages.map((m) => ({
        ...m,
        content: m.content ? this.sanitizeInput(m.content) : null,
      }));
      
      // 2. Use OpenRouter API instead of Groq
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva Platform",
        },
        body: JSON.stringify({
          model: String(options.model || "openai/gpt-4o-mini"),
          messages: safeMessages,
          temperature: typeof options.temperature === "number" ? options.temperature : 0.7,
          max_tokens: typeof options.maxTokens === "number" ? options.maxTokens : 1024,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
          tools: options.tools,
          tool_choice: options.tool_choice,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 3. Calculate credits and log usage
      if (options.storeId && typeof options.storeId === "string") {
        const inputTokens = data.usage?.prompt_tokens ?? 0;
        const outputTokens = data.usage?.completion_tokens ?? 0;
        const toolCallsCount = data.choices[0]?.message.tool_calls?.length ?? 0;
        
        const creditConsumption = AICreditService.calculateCreditConsumption(
          data.model,
          inputTokens,
          outputTokens,
          0,
          toolCallsCount
        );
        
        await AICreditService.deductCredits(
          options.storeId,
          creditConsumption.creditsUsed,
          { requestId: options.requestId as string }
        );
        
        await prisma.aiUsageEvent.create({
          data: {
            storeId: options.storeId,
            model: data.model,
            inputTokens,
            outputTokens,
            toolCallsCount,
            creditsUsed: creditConsumption.creditsUsed,
            success: true,
            channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
            requestId: (options.requestId as string) || "",
          },
        });
      }
      
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[GroqClient/OpenRouter] API call failed", { error: message });
      return null; // Graceful degradation
    }
  }
}
