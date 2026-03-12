/**
 * AI Provider Configuration
 * 
 * Supported providers:
 * - Groq: Ultra-fast inference for WhatsApp AI Agent and real-time tasks
 * - DeepSeek: Cost-effective general AI tasks and complex reasoning
 * - ML (Local): Free machine learning models running locally
 */

export const AI_PROVIDERS = {
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    models: {
      fast: "llama-3.1-8b-instant",           // For quick responses
      balanced: "llama-3.1-70b-versatile",    // Default for most tasks
      powerful: "mixtral-8x7b-32768",          // For complex reasoning
    },
    // Pricing per 1M tokens (as of Feb 2026)
    pricing: {
      input: 0.59,
      output: 0.79,
    },
    context: {
      MERCHANT: process.env.GROQ_API_KEY_MERCHANT,
      SUPPORT: process.env.GROQ_API_KEY_SUPPORT,
    },
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    models: {
      chat: "deepseek-chat",        // General conversational AI
      coder: "deepseek-coder",      // Code generation and analysis
      reasoner: "deepseek-reasoner", // Complex reasoning tasks
    },
    // Pricing per 1M tokens (as of Feb 2026)
    pricing: {
      input: 0.14,
      output: 0.28,
    },
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  ml: {
    // Local ML - completely FREE, no API calls
    baseUrl: "local",
    models: {
      sentiment: "lexicon-based",      // Free sentiment analysis
      intent: "rule-based",            // Free intent classification
      forecast: "statistical",         // Free sales forecasting
      recommend: "collaborative-filter", // Free recommendations
      embed: "tf-idf",                 // Free text similarity
    },
    pricing: {
      input: 0,
      output: 0,
    },
    features: {
      sentimentAnalysis: true,
      intentClassification: true,
      salesForecasting: true,
      productRecommendations: true,
      anomalyDetection: true,
      priceOptimization: true,
    },
  },
} as const;

export type AIProvider = keyof typeof AI_PROVIDERS;
export type GroqModel = typeof AI_PROVIDERS.groq.models[keyof typeof AI_PROVIDERS.groq.models];
export type DeepSeekModel = typeof AI_PROVIDERS.deepseek.models[keyof typeof AI_PROVIDERS.deepseek.models];
export type MLModel = typeof AI_PROVIDERS.ml.models[keyof typeof AI_PROVIDERS.ml.models];

/**
 * Select the appropriate AI provider based on use case
 */
export function selectProvider(useCase: "whatsapp" | "general" | "coding" | "reasoning" | "ml" | "sentiment" | "forecast" | "recommend" | "intent"): AIProvider {
  switch (useCase) {
    case "whatsapp":
      // Groq for WhatsApp - fast responses critical for conversational
      return "groq";
    case "coding":
      // DeepSeek Coder for code-related tasks
      return "deepseek";
    case "reasoning":
      // DeepSeek for complex reasoning (cheaper than alternatives)
      return "deepseek";
    case "sentiment":
    case "forecast":
    case "recommend":
    case "intent":
    case "ml":
      // Use FREE local ML for these tasks
      return "ml";
    case "general":
    default:
      // Default to DeepSeek for cost-effectiveness
      return "deepseek";
  }
}

/**
 * Get model recommendation based on task requirements
 */
export function getModelRecommendation(
  provider: AIProvider,
  priority: "speed" | "quality" | "cost"
): string {
  if (provider === "groq") {
    switch (priority) {
      case "speed":
        return AI_PROVIDERS.groq.models.fast;
      case "quality":
        return AI_PROVIDERS.groq.models.powerful;
      case "cost":
      default:
        return AI_PROVIDERS.groq.models.balanced;
    }
  }

  if (provider === "deepseek") {
    switch (priority) {
      case "speed":
        return AI_PROVIDERS.deepseek.models.chat;
      case "quality":
        return AI_PROVIDERS.deepseek.models.reasoner;
      case "cost":
      default:
        return AI_PROVIDERS.deepseek.models.chat;
    }
  }

  return AI_PROVIDERS.groq.models.balanced;
}

/**
 * Cost estimation helper (in USD per 1M tokens)
 */
export function estimateCost(
  provider: AIProvider,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = AI_PROVIDERS[provider].pricing;
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Check if ML features are available (always true for local ML)
 */
export function isMLAvailable(): boolean {
  return true; // Local ML is always available
}

/**
 * Get ML feature availability
 */
export function getMLFeatures(): Record<string, boolean> {
  return { ...AI_PROVIDERS.ml.features };
}
