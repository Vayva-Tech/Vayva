import { logger } from "@/lib/logger";

// Regex to identify potential sensitive data patterns (generic PII + keys)
const SENSITIVE_REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g,
  BEARER: /Bearer [a-zA-Z0-9.\-_~+/]+=*/g,
  API_KEY: /(sk-|pk-|rk_)[a-zA-Z0-9]{20,}/g,
  CARD: /\b(?:\d[ -]*?){15,16}\b/g,
  SSH_KEY:
    /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+ PRIVATE KEY-----/g,
  JWT: /eyJ[a-zA-Z0-9-_]+\.eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/g,
};

export class RescueOpenRouterClient {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    if (!this.apiKey) {
      logger.warn(
        "[RescueOpenRouterClient] No API key found. Rescue features will fallback to safe mode.",
      );
    }
  }

  /**
   * Strip sensitive data from logs/errors before sending to AI
   */
  sanitizeInput(text: string): string {
    return text
      .replace(SENSITIVE_REGEX.SSH_KEY, "[REDACTED_PRIVATE_KEY]")
      .replace(SENSITIVE_REGEX.JWT, "[REDACTED_JWT]")
      .replace(SENSITIVE_REGEX.API_KEY, "$1[REDACTED_KEY]")
      .replace(SENSITIVE_REGEX.BEARER, "Bearer [REDACTED_TOKEN]")
      .replace(SENSITIVE_REGEX.EMAIL, "[REDACTED_EMAIL]")
      .replace(SENSITIVE_REGEX.PHONE, "[REDACTED_PHONE]")
      .replace(SENSITIVE_REGEX.CARD, "[REDACTED_SENSITIVE]");
  }

  /**
   * Generate a diagnostic completion
   */
  async diagnosticCompletion(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ) {
    if (!this.apiKey) {
      logger.warn("[RescueOpenRouterClient] Call skipped due to missing API key");
      return null;
    }

    try {
      const safeMessages = messages.map((m: any) => ({
        ...m,
        content: this.sanitizeInput(m.content),
      }));

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva Ops Rescue",
        },
        body: JSON.stringify({
          messages: safeMessages,
          model: options.model || "google/gemini-2.5-flash",
          temperature: options.temperature ?? 0.1,
          max_tokens: options.maxTokens ?? 2048,
          stop: ["MUTATION_ATTEMPT"],
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.choices[0]?.message?.content || null;
    } catch (error: unknown) {
      logger.error("[RescueOpenRouterClient] API call failed", { error });
      return null;
    }
  }
}
