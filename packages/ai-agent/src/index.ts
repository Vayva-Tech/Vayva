export { SalesAgent } from "./lib/ai/sales-agent.js";
export { AI_PROVIDERS, selectProvider, getModelRecommendation, estimateCost, isMLAvailable, getMLFeatures } from "./lib/ai/providers.js";
export { DeepSeekClient } from "./lib/ai/deepseek-client.js";
export { GroqClient } from "./lib/ai/groq-client.js";
export { VoiceProcessor } from "./lib/ai/voice-processor.js";
export { DataGovernanceService } from "./lib/governance/data-governance.service";
export { NotificationService } from "./services/notifications.js";

// ML Module - Free machine learning
export {
  MLInferenceClient,
  SentimentAnalyzer,
  SalesForecaster,
  RecommendationEngine,
  IntentClassifier,
  SimpleEmbedding,
} from "./lib/ml";
export type {
  SalesForecast,
  IntentResult,
  SentimentResult,
  RecommendationResult,
} from "./lib/ml/ml-client.js";
