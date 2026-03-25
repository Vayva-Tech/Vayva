export { BaseAIService } from "./lib/ai/base-ai-service";
export {
  getClinicalAIConfig,
  type ClinicalInsight,
  type ClinicalNoteSummary,
  type ContractAnalysisResult,
  type DocumentAutomationResult,
  type LegalResearchResult,
  type TreatmentRecommendation,
} from "./lib/ai/industry-ai-types";
export { SalesAgent } from "./lib/ai/sales-agent";
export { AI_PROVIDERS, selectProvider, getModelRecommendation, estimateCost, isMLAvailable, getMLFeatures } from "./lib/ai/providers";
export { DeepSeekClient } from "./lib/ai/deepseek-client";
export { OpenRouterClient } from "./lib/ai/openrouter-client";
export { VoiceProcessor } from "./lib/ai/voice-processor";
export { DataGovernanceService } from "./lib/governance/data-governance.service";
export { NotificationService } from "./services/notifications";

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
} from "./lib/ml/ml-client";
