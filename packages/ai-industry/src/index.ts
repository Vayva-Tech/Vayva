/**
 * @vayva/ai-industry
 * Industry-trained AI Business Assistant for Vayva
 */

// Core exports
export { VayvaAI } from './vayva-ai';
export type { VayvaAIOptions } from './vayva-ai';

// AI Trend Intelligence exports
export { AITrendIntelligenceService } from './trend-intelligence';
export type {
  TrendCategory,
  TrendConfidence,
  ForecastHorizon,
  DataGranularity,
  MarketTrend,
  TrendForecast,
  CompetitiveIntelligence,
  ConsumerInsight,
  SeasonalPattern,
  EconomicIndicator,
  SupplyChainRisk,
  TrendAnalysisQuery,
  TrendAlert
} from './trend-intelligence';

// Dynamic Pricing exports
export { DynamicPricingService } from './dynamic-pricing';
export type {
  PricingStrategy,
  PriceAdjustmentReason,
  MarketCondition,
  ProductPricingContext,
  CompetitorPricing,
  DemandSignal,
  PriceOptimizationRule,
  PriceAdjustment,
  PricingAnalytics,
  DynamicPricingConfig,
  PriceSimulation
} from './dynamic-pricing';

// Type exports
export type {
  IndustrySlug,
  LanguageCode,
  ChannelType,
  MerchantTone,
  VayvaAIConfig,
  VayvaAICapabilities,
  EscalationRule,
  ConversationMessage,
  AIConversation,
  IntentClassification,
  ProductRecommendation,
  OrderResult,
  ConversationResult,
  EscalationDecision,
  TrainingScenario,
  LanguageConfig,
  ChannelConfig,
  Customer,
  CustomerOrder,
  ConversationContext,
  IndustryContext,
} from './types';

// Language exports
export {
  languageService,
  languageConfigs,
  yorubaHandler,
  hausaHandler,
  igboHandler,
  pidginHandler,
} from './languages';

// Channel exports
export {
  WhatsAppChannel,
  WebChatChannel,
  VoiceChannel,
  channelImplementations,
} from './channels';
export type {
  WhatsAppConfig,
  WhatsAppMessage,
  WebChatConfig,
  WebChatMessage,
  VoiceConfig,
  VoiceCall,
} from './channels';

// Industry training exports
export {
  fashionTraining,
  restaurantTraining,
  realEstateTraining,
  healthcareTraining,
  industryTrainingData,
  getIndustryContext,
  getIndustryScenarios,
  getAllScenarios,
} from './industry-training';

// Re-export training data types
export type {
  fashionContext as FashionContext,
  fashionScenarios as FashionScenarios,
} from './industry-training/fashion-training';
export type {
  restaurantContext as RestaurantContext,
  restaurantScenarios as RestaurantScenarios,
} from './industry-training/restaurant-training';
export type {
  realEstateContext as RealEstateContext,
  realEstateScenarios as RealEstateScenarios,
} from './industry-training/realestate-training';
export type {
  healthcareContext as HealthcareContext,
  healthcareScenarios as HealthcareScenarios,
} from './industry-training/healthcare-training';

// Version
export const VERSION = '1.0.0';
