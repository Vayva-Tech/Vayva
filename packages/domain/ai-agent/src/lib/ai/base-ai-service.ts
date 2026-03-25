/**
 * Minimal AI orchestration base for industry packages.
 * Subclasses implement prompts/parsing; when no model response is available,
 * `defaultOutput` supplies typed fallbacks.
 */
export abstract class BaseAIService<TInput, TOutput> {
  constructor(protected readonly _options: Record<string, unknown>) {}

  protected addValidationRule(rule: {
    id: string;
    validate: (data: TOutput) => boolean;
    errorMessage: string;
    isCritical?: boolean;
  }): void {
    void rule;
  }

  async initialize(): Promise<void> {}

  async dispose(): Promise<void> {}

  protected abstract buildPrompt(input: TInput): Promise<string>;
  protected abstract parseResponse(rawResponse: string, input: TInput): Promise<TOutput>;
  protected abstract defaultOutput(input: TInput): TOutput;

  /** Override when wiring a live LLM; empty string triggers `defaultOutput`. */
  protected async complete(_prompt: string): Promise<string> {
    return "";
  }

  async execute(input: TInput): Promise<TOutput> {
    const prompt = await this.buildPrompt(input);
    const raw = await this.complete(prompt);
    if (!raw.trim()) {
      return this.defaultOutput(input);
    }
    try {
      return await this.parseResponse(raw, input);
    } catch {
      return this.defaultOutput(input);
    }
  }
}
