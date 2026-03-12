import { Groq } from "groq-sdk";
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

export class RescueGroqClient {
  private client: Groq | null = null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY_RESCUE;

    if (!apiKey) {
      logger.warn(
        "[RescueGroqClient] No API key found. Rescue features will fallback to safe mode.",
      );
      return;
    }

    this.client = new Groq({
      apiKey,
      dangerouslyAllowBrowser: false,
    });
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
    if (!this.client) {
      logger.warn("[RescueGroqClient] Call skipped due to missing API key");
      return null;
    }

    try {
      const safeMessages = messages.map((m: any) => ({
        ...m,
        content: this.sanitizeInput(m.content),
      }));

      const response = await this.client.chat.completions.create({
        messages: safeMessages,
        model: options.model || "llama3-70b-8192", // High reasoning model for code/logs
        temperature: options.temperature ?? 0.1, // Low temp for deterministic diagnostics
        max_tokens: options.maxTokens ?? 2048,
        stop: ["MUTATION_ATTEMPT"], // Guardrail stop sequence
      });

      logger.info("[RescueGroqClient] Diagnostic success", {
        model: response.model,
        usage: response.usage,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error: unknown) {
      logger.error("[RescueGroqClient] API call failed", { error });
      return null;
    }
  }
}
