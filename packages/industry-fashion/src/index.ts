// @ts-nocheck
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
} from './fashion.engine';

// Types
export * from './types';

// Features (Backend Services)
export * from './features/auto-replenishment';
export * from './features/demand-forecast';
export * from './features/size-curve-optimizer';
export * from './features/wholesale';
export * from './features/visual-search';
export * from './features/size-prediction';

// Services
export * from './services/ai-recommendation-engine';
export * from './services/external-trend-analysis';
export * from './services/analytics-integration';
export * from './services/review-system-integration';
export * from './services/advanced-demand-forecasting';
export * from './services/size-curve-service';
export * from './services/lookbook-service';
export * from './services/inventory-alerts.service';
export * from './services/trend-analysis.service';

// Dashboard Configuration
export {
  FASHION_DASHBOARD_CONFIG,
} from './dashboard-config';

// Components
export * from './components';

// Marketing Components
export * from './components/marketing/CampaignManager';
export * from './components/marketing/SocialCommerce';
export * from './components/marketing/InfluencerTracker';
export * from './components/marketing/ROASTracker';
export * from './components/marketing/EmailMarketing';
export * from './components/marketing/CustomerSegmentation';

// Finance Components
export * from './components/finance/FinanceAnalytics';

// Control Center Components
export * from './components/control-center/ThemeCustomizer';
export * from './components/control-center/HomepageBuilder';
