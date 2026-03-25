import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";
import { AICreditService } from "./credit-service";
import { getAiPackage } from "@/lib/ai/ai-packages";

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

interface _ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  tools?: unknown[];
  tool_choice?: unknown;
  storeId?: string;
  requestId?: string;
  messageCost?: number;
}

interface ChatCompletionChoice {
  message: {
    role?: string;
    content: string;
    tool_calls?: unknown[];
  };
  finish_reason?: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens?: number;
  };
  model: string;
}

/** Map abstract AI credits to kobo for AiUsageEvent.costEstimateKobo (≈1 credit ≈ ₦1). */
function creditsToCostKobo(credits: number): bigint {
  return BigInt(Math.max(0, Math.round(credits * 100)));
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
   * DEFAULT: Gemini 2.5 Flash (high quality multimodal)
   */
  getRecommendedModel(useCase: string = "general"): string {
    void useCase;
    return "google/gemini-2.5-flash";
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
      const storeId =
        typeof options.storeId === "string" ? (options.storeId as string) : "";

      // Determine token cap by plan (fallback: safe default).
      let planMaxTokens: number | undefined;
      if (storeId && typeof options.maxTokens !== "number") {
        const sub = await prisma.merchantAiSubscription.findUnique({
          where: { storeId },
          select: { planKey: true },
        });
        const pkg = getAiPackage(sub?.planKey);
        planMaxTokens = pkg.caps.chatMaxOutputTokens;
      }

      // 3. Prepare request payload
      const payload: Record<string, unknown> = {
        model,
        messages: safeMessages,
        temperature:
          typeof options.temperature === "number" ? options.temperature : 0.7,
        max_tokens:
          typeof options.maxTokens === "number"
            ? options.maxTokens
            : planMaxTokens ?? 1024,
      };
      if (options.jsonMode) {
        payload.response_format = { type: "json_object" };
      }
      if (options.tools != null && typeof options.tools === "object") {
        payload.tools = options.tools;
      }
      if (options.tool_choice != null) {
        payload.tool_choice = options.tool_choice;
      }

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

      // 5. Deduct message quota and log usage
      const inputTokens = data.usage?.prompt_tokens ?? 0;
      const outputTokens = data.usage?.completion_tokens ?? 0;
      const toolCallsCount = data.choices[0]?.message.tool_calls?.length ?? 0;

      // Default: 1 AI message per call (message-pack system)
      const messageCostRaw = (options as { messageCost?: unknown }).messageCost;
      const messageCost =
        typeof messageCostRaw === "number"
          ? Math.max(1, Math.ceil(messageCostRaw))
          : 1;

      if (options.storeId && typeof options.storeId === "string") {
        const creditCheck = await AICreditService.deductCredits(
          options.storeId,
          messageCost,
          { requestId: options.requestId as string, skipInsufficientCheck: false }
        );

        if (!creditCheck.success || creditCheck.blocked) {
          logger.warn(
            "[OpenRouterClient] Request blocked due to insufficient credits",
            "AI",
            {
              storeId: options.storeId,
              creditsRequired: messageCost,
              creditsRemaining: creditCheck.remainingCredits,
            },
          );
          
          // Still log the event but mark as blocked
          await prisma.aiUsageEvent
            .create({
              data: {
                storeId: options.storeId,
                model: data.model,
                inputTokens,
                outputTokens,
                toolCallsCount,
                costEstimateKobo: BigInt(0),
                success: false,
                errorType: "INSUFFICIENT_CREDITS",
                channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
              },
            })
            .catch((e: unknown) =>
              logger.warn("[OpenRouterClient] Audit log failed", "AI", {
                error: e,
              })
            );

          // Return special response for insufficient credits
          const blocked: ChatCompletionResponse = {
            id: "blocked",
            choices: [
              {
                message: {
                  role: "assistant",
                  content:
                    "I'm sorry, but you've run out of AI credits. Please top up your credits to continue using AI features. You can add 1,000 credits for ₦3,000.",
                },
                finish_reason: "stop",
              },
            ],
            model: data.model,
            usage: data.usage,
          };
          return blocked;
        }

        // Log successful usage with messages deducted
        await prisma.aiUsageEvent
          .create({
            data: {
              storeId: options.storeId,
              model: data.model,
              inputTokens,
              outputTokens,
              toolCallsCount,
              costEstimateKobo: creditsToCostKobo(messageCost),
              success: true,
              channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
              requestId: (options.requestId as string) || "",
            },
          })
          .catch((e: unknown) =>
            logger.warn("[OpenRouterClient] Audit log failed", "AI", {
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