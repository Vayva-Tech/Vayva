import { logger } from "@/lib/logger";
import { api } from '@/lib/api-client';

// Regex to identify potential emails and phone numbers for stripping
const PII_REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3,4}[-.]?\d{4}/g,
  CARD: /\b(?:\d[ -]*?){13,16}\b/g,
};

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  tools?: unknown[];
  tool_choice?: unknown;
  storeId?: string;
  requestId?: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: { content?: string; tool_calls?: unknown[] };
  }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  model?: string;
}

export class OpenRouterClient {
  context: string;
  apiKey: string | null;
  referer: string;

  constructor(context: string = "MERCHANT") {
    this.context = context;
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    this.referer = process.env.OPENROUTER_REFERER || "https://merchant.vayva.ng";
    if (!this.apiKey) {
      logger.warn(
        `[OpenRouterClient] No API key found for ${context} context. AI features will fallback.`,
      );
    }
  }

  sanitizeInput(text: string): string {
    return text
      .replace(PII_REGEX.EMAIL, "[REDACTED_EMAIL]")
      .replace(PII_REGEX.PHONE, "[REDACTED_PHONE]")
      .replace(PII_REGEX.CARD, "[REDACTED_SENSITIVE]");
  }

  async chatCompletion(
    messages: ChatCompletionMessage[],
    options: ChatCompletionOptions = {},
  ): Promise<ChatCompletionResponse | null> {
    if (!this.apiKey) return null;

    const safeMessages = messages.map((m) => ({
      ...m,
      content: m.content ? this.sanitizeInput(m.content) : null,
    }));

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": this.referer,
        "X-Title": "Vayva Merchant",
      },
      body: JSON.stringify({
        model: options.model || "google/gemini-2.0-flash-lite-001",
        messages: safeMessages,
        temperature: typeof options.temperature === "number" ? options.temperature : 0.7,
        max_tokens: typeof options.maxTokens === "number" ? options.maxTokens : 1024,
        response_format: options.jsonMode ? { type: "json_object" } : undefined,
        tools: options.tools,
        tool_choice: options.tool_choice,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as ChatCompletionResponse;

    if (options.storeId) {
      // Log usage via backend API (fire and forget)
      api.post('/ai/usage/log', {
        storeId: options.storeId,
        channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
        model: String(data.model || options.model || ""),
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        toolCallsCount: data.choices?.[0]?.message?.tool_calls?.length || 0,
        requestId: options.requestId || "",
        success: true,
      }).catch(() => {}); // Ignore logging errors
    }

    return data;
  }
}

