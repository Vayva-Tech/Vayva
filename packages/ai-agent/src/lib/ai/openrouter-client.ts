import { logger } from "../logger";
import { prisma } from "@vayva/db";

// Regex to identify potential emails and phone numbers for stripping
const PII_REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3,4}[-.]?\d{4}/g,
  CARD: /\b(?:\d[ -]*?){13,16}\b/g, // Simplified card-like pattern
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  tools?: any[];
  tool_choice?: any;
  storeId?: string;
  requestId?: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      tool_calls?: any[];
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenRouterClient {
  context: string;
  apiKey: string | null;
  
  constructor(context: string = "MERCHANT") {
    this.context = context;
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    
    if (!this.apiKey) {
      logger.warn(
        `[OpenRouterClient] No API key found for ${context} context. AI features will fallback.`,
      );
    }
  }

  /**
   * Strip PII from input text
   */
  sanitizeInput(text: string): string {
    return text
      .replace(PII_REGEX.EMAIL, "[REDACTED_EMAIL]")
      .replace(PII_REGEX.PHONE, "[REDACTED_PHONE]")
      .replace(PII_REGEX.CARD, "[REDACTED_SENSITIVE]");
  }

  /**
   * Get recommended model based on use case
   */
  getRecommendedModel(useCase: string = "general"): string {
    void useCase;
    return "google/gemini-2.5-flash";
  }

  /**
   * Generate a completion with safe handling
   */
  async chatCompletion(
    messages: unknown[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse | null> {
    if (!this.apiKey) {
      logger.warn("[OpenRouterClient] Call skipped due to missing API key");
      return null;
    }

    try {
      // 1. Sanitize user messages
      const safeMessages: ChatCompletionMessage[] = Array.isArray(messages)
        ? messages
            .filter((m): m is ChatCompletionMessage =>
              typeof m === "object" && m !== null && 
              typeof (m as any).content === "string"
            )
            .map((m) => ({
              ...m,
              content: this.sanitizeInput(m.content)
            }))
        : [];

      // 2. Determine model
      const model = options.model || this.getRecommendedModel();

      // 3. Prepare request payload
      const payload = {
        model,
        messages: safeMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        ...(options.jsonMode && { response_format: { type: "json_object" } }),
        ...(options.tools && { tools: options.tools }),
        ...(options.tool_choice && { tool_choice: options.tool_choice })
      };

      // 4. Call OpenRouter API with Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva AI"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data: ChatCompletionResponse = await response.json();

      // 5. Real Audit Logging (No secrets)
      if (options.storeId) {
        await prisma.aiUsageEvent
          .create({
            data: {
              storeId: options.storeId,
              model: data.model,
              inputTokens: data.usage?.prompt_tokens || 0,
              outputTokens: data.usage?.completion_tokens || 0,
              toolCallsCount: data.choices[0]?.message?.tool_calls?.length || 0,
              requestId: options.requestId || "",
              success: true,
              channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
            },
          })
          .catch((e: unknown) =>
            logger.warn("[OpenRouterClient] Audit log failed", undefined, {
              error: e,
            })
          );
      }

      return data;
    } catch (error: unknown) {
      logger.error("[OpenRouterClient] API call failed", { error });
      return null; // Graceful degradation
    }
  }
}