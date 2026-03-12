import { Groq } from "groq-sdk";
import { Chat } from "groq-sdk/resources/chat";
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

type ChatCompletionOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  tools?: Chat.ChatCompletionTool[] | null;
  tool_choice?: Chat.ChatCompletionToolChoiceOption | null;
  storeId?: string;
  requestId?: string;
};

export class GroqClient {
  context: string;
  client: Groq | null;
  constructor(context: string = "MERCHANT") {
    this.context = context;
    const apiKey =
      context === "MERCHANT"
        ? process.env.GROQ_API_KEY_MERCHANT
        : process.env.GROQ_API_KEY_SUPPORT;
    if (!apiKey) {
      logger.warn(
        `[GroqClient] No API key found for ${context} context. AI features will fallback.`,
      );
    }
    this.client = apiKey
      ? new Groq({
          apiKey,
          dangerouslyAllowBrowser: false,
        })
      : null;
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
    messages: unknown[],
    options: ChatCompletionOptions = {},
  ): Promise<Chat.ChatCompletion | null> {
    if (!this.client) {
      logger.warn("[GroqClient] Call skipped due to missing API key");
      return null;
    }
    try {
      // 1. Sanitize user messages
      const safeMessages: Chat.ChatCompletionMessageParam[] = Array.isArray(
        messages,
      )
        ? messages
            .filter((m): m is Chat.ChatCompletionMessageParam =>
              typeof m === "object" && m !== null,
            )
            .map((m) =>
              typeof m.content === "string"
                ? { ...m, content: this.sanitizeInput(m.content) }
                : m,
            )
        : [];
      // 2. Call API with Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const response = await this.client.chat.completions.create(
        {
          messages: safeMessages,
          model: options.model || "llama3-70b-8192",
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1024,
          response_format: options.jsonMode
            ? { type: "json_object" }
            : undefined,
          tools: options.tools,
          tool_choice: options.tool_choice,
        },
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);
      // 3. Real Audit Logging (No secrets)
      if (options.storeId) {
        const model = response.model;
        const usage = response.usage;
        const firstChoice = response.choices[0];
        const toolCallsCount = firstChoice.message.tool_calls?.length || 0;
        await prisma.aiUsageEvent
          .create({
            data: {
              storeId: options.storeId,
              model: typeof model === "string" ? model : options.model || "",
              inputTokens:
                typeof usage?.prompt_tokens === "number"
                  ? usage.prompt_tokens
                  : 0,
              outputTokens:
                typeof usage?.completion_tokens === "number"
                  ? usage.completion_tokens
                  : 0,
              toolCallsCount,
              requestId: options.requestId || "",
              success: true,
              channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
            },
          })
          .catch((e: unknown) =>
            logger.warn("[GroqClient] Audit log failed", undefined, {
              error: e,
            }),
          );
      }
      return response;
    } catch (error: unknown) {
      logger.error("[GroqClient] API call failed", { error });
      return null; // Graceful degradation
    }
  }
}
