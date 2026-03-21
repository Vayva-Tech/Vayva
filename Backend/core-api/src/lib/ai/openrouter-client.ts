import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";
import { AICreditService } from "./credit-service";

// Regex to identify potential emails and phone numbers for stripping
const PII_REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3,4}[-.]?\d{4}/g,
  CARD: /\b(?:\d[ -]*?){13,16}\b/g, // Simplified card-like pattern
};

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | null;
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
   * DEFAULT: GPT-4o Mini for all requests (cheapest & best value)
   */
  getRecommendedModel(useCase: string = "general"): string {
    const models = {
      // PRIMARY MODEL - Used for 95% of requests
      general: "openai/gpt-4o-mini",
      
      // FALLBACK MODELS - Auto-routed for specific complex tasks
      reasoning: "anthropic/claude-3-sonnet", // Complex business logic
      realtime: "openai/gpt-4o-mini", // Fast & cheap
      technical: "mistralai/mistral-large", // Code generation
      creative: "openai/gpt-4o-mini", // Writing & content
    };

    return models[useCase as keyof typeof models] || models.general;
  }

  /**
   * Generate a completion with safe handling
   */
  async chatCompletion(
    messages: ChatCompletionMessage[],
    options: Record<string, unknown> = {}
  ): Promise<ChatCompletionResponse | null> {
    if (!this.apiKey) {
      logger.warn("[OpenRouterClient] Call skipped due to missing API key");
      return null;
    }

    try {
      // 1. Sanitize user messages
      const safeMessages = messages.map((m) => ({
        ...m,
        content: m.content ? this.sanitizeInput(m.content) : null,
      }));

      // 2. Determine model
      const model = String(options.model || this.getRecommendedModel());

      // 3. Prepare request payload
      const payload = {
        model,
        messages: safeMessages,
        temperature:
          typeof options.temperature === "number" ? options.temperature : 0.7,
        max_tokens:
          typeof options.maxTokens === "number" ? options.maxTokens : 1024,
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

      // 5. Calculate credits consumed
      const inputTokens = data.usage?.prompt_tokens ?? 0;
      const outputTokens = data.usage?.completion_tokens ?? 0;
      const toolCallsCount = data.choices[0]?.message.tool_calls?.length ?? 0;
      
      const creditConsumption = AICreditService.calculateCreditConsumption(
        data.model,
        inputTokens,
        outputTokens,
        0, // imageCount
        toolCallsCount
      );

      // 6. Deduct credits and log usage
      if (options.storeId && typeof options.storeId === "string") {
        // First check if enough credits
        const creditCheck = await AICreditService.deductCredits(
          options.storeId,
          creditConsumption.creditsUsed,
          { requestId: options.requestId as string, skipInsufficientCheck: false }
        );

        if (!creditCheck.success || creditCheck.blocked) {
          logger.warn("[OpenRouterClient] Request blocked due to insufficient credits", {
            storeId: options.storeId,
            creditsRequired: creditConsumption.creditsUsed,
            creditsRemaining: creditCheck.remainingCredits,
          });
          
          // Still log the event but mark as blocked
          await prisma.aiUsageEvent
            .create({
              data: {
                storeId: options.storeId,
                model: data.model,
                inputTokens,
                outputTokens,
                toolCallsCount,
                creditsUsed: 0, // No credits charged for blocked request
                success: false,
                errorType: "INSUFFICIENT_CREDITS",
                channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
              },
            })
            .catch((e: unknown) =>
              logger.warn("[OpenRouterClient] Audit log failed", undefined, {
                error: e,
              })
            );

          // Return special response for insufficient credits
          return {
            id: "blocked",
            choices: [{
              message: {
                role: "assistant",
                content: "I'm sorry, but you've run out of AI credits. Please top up your credits to continue using AI features. You can add 1,000 credits for ₦3,000.",
              },
              finish_reason: "stop",
            }],
            model: data.model,
            usage: data.usage,
          } as ChatCompletionResponse;
        }

        // Log successful usage with credits
        await prisma.aiUsageEvent
          .create({
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
          })
          .catch((e: unknown) =>
            logger.warn("[OpenRouterClient] Audit log failed", undefined, {
              error: e,
            })
          );
      }

      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[OpenRouterClient] API call failed", { error: message });
      return null; // Graceful degradation
    }
  }
}