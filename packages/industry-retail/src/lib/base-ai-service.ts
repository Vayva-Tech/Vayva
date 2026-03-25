import { OpenRouterClient } from "@vayva/ai-agent";

export interface BaseAIServiceOptions {
  model: string;
  temperature: number;
  requireHumanValidation: boolean;
  confidenceThreshold: number;
}

/**
 * Minimal LLM-backed base for retail advisory services (forecasting, pricing, recommendations).
 * Uses Groq when configured; otherwise returns "{}" so callers still typecheck (parse may throw).
 */
export abstract class BaseAIService<TInput, TOutput> {
  protected readonly options: BaseAIServiceOptions;

  constructor(options: BaseAIServiceOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    // Hook for subclasses; idempotent setup point for retail engine.
  }

  async execute(input: TInput): Promise<TOutput> {
    await this.initialize();
    const prompt = await this.buildPrompt(input);
    const rawResponse = await this.invokeModel(prompt);
    return this.parseResponse(rawResponse, input);
  }

  protected abstract buildPrompt(input: TInput): Promise<string>;
  protected abstract parseResponse(rawResponse: string, input: TInput): Promise<TOutput>;

  protected async invokeModel(prompt: string): Promise<string> {
    const client = new OpenRouterClient("MERCHANT");
    const completion = await client.chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a retail analytics assistant. Reply with one valid JSON object only, no markdown fences.",
        },
        { role: "user", content: prompt },
      ],
      {
        model: this.options.model || "google/gemini-2.5-flash",
        temperature: this.options.temperature,
        jsonMode: true,
        maxTokens: 2048,
      },
    );
    const content = completion?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : "{}";
  }
}
