/**
 * @vayva/industry-fashion - Unified Fashion Industry Package
 *
 * Complete fashion industry solution including:
 * - Auto-Replenishment & Inventory Optimization
 * - Demand Forecasting & Trend Analytics
 * - Size Curve Optimization
 * - Wholesale & B2B Portal
 * - Visual Search & Recommendations
 */

// Main engine
export {
  FashionEngine,
  FashionEngineFactory,
  createDefaultFashionConfig,
  type FashionEngineConfig,
  type FashionFeatureId,
  type FashionEngineStatus,
} from "./fashion.engine";

// Types (dashboard UI shapes; feature-specific types are exported from feature modules below)
export * from "./types";

// Features (explicit exports — avoids duplicate `SizeDistribution` / `DemandForecast` with services)
export * from "./features/auto-replenishment";
export {
  DemandForecastService,
  demandForecast,
} from "./features/demand-forecast";
export type {
  ForecastHorizon,
  ForecastParams,
  DemandForecast,
  DailyDemandPoint,
  ForecastAlert,
  SizeCurveOptimization,
  SizeStockoutRisk,
  SeasonalityPattern,
  AutoReplenishmentRule,
} from "./features/demand-forecast";
export type { SizeDistribution as DemandForecastSizeDistribution } from "./features/demand-forecast";

export * from "./features/size-curve-optimizer";
export * from "./features/wholesale";
export * from "./features/visual-search";
export * from "./features/size-prediction";

// Services (no `export *` from ai-recommendation-engine — clashes with `AIRecommendation` in components)
export {
  AIRecommendationEngine,
  aiRecommendationEngine,
} from "./services/ai-recommendation-engine";
export type { AIRecommendation as FashionAIRecommendationRecord } from "./services/ai-recommendation-engine";

export * from "./services/external-trend-analysis";
export * from "./services/analytics-integration";
export * from "./services/review-system-integration";

export {
  AdvancedDemandForecastingService,
  advancedDemandForecasting,
} from "./services/advanced-demand-forecasting";
export type {
  AdvancedDemandForecastEntry,
  SeasonalityPattern as AdvancedDemandSeasonalityPattern,
} from "./services/advanced-demand-forecasting";

export { SizeCurveService } from "./services/size-curve-service";
export type { ProductSizeCurveRow } from "./services/size-curve-service";

export * from "./services/lookbook-service";
export * from "./services/inventory-alerts.service";
export * from "./services/trend-analysis.service";
export * from "./services/wholesale-customer.service";
export * from "./services/collection-analytics.service";

// Dashboard Configuration
export { FASHION_DASHBOARD_CONFIG } from "./dashboard-config";

// Components
export * from "./components";

// Marketing Components
export * from "./components/marketing/CampaignManager";
export * from "./components/marketing/SocialCommerce";
export * from "./components/marketing/InfluencerTracker";
export * from "./components/marketing/ROASTracker";
export * from "./components/marketing/EmailMarketing";
export * from "./components/marketing/CustomerSegmentation";

// Finance Components
export * from "./components/finance/FinanceAnalytics";

// Control Center Components
export * from "./components/control-center/ThemeCustomizer";
export * from "./components/control-center/HomepageBuilder";
