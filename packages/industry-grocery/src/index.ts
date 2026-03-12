/**
 * @vayva/industry-grocery
 * Vayva Grocery Industry Engine
 *
 * Provides specialized features for grocery stores including:
 * - Freshness tracking and quality control
 * - Delivery route optimization
 * - Expiration alerts management
 * - Seasonal and dynamic pricing
 */

// Main engine
export {
  GroceryEngine,
  GroceryEngineFactory,
  createDefaultGroceryConfig,
  type GroceryEngineConfig,
  type GroceryFeatureId,
  type GroceryEngineStatus,
} from './grocery.engine.js';

// Services
export {
  FreshnessTrackingService,
  DeliveryRouteOptimizerService,
  ExpirationAlertsService,
  SeasonalPricingService,
} from './services/index.js';

export type {
  FreshnessRecord,
  FreshnessAlert,
  FreshnessConfig,
  DeliveryRoute,
  DeliveryStop,
  DeliveryConfig,
  ExpirationAlert,
  AlertConfig,
  PricingRule,
  PriceCalculation,
  SeasonalPricingConfig,
} from './services/index.js';

// Features
export {
  FreshnessTrackingFeature,
  DeliveryOptimizationFeature,
  ExpirationAlertsFeature,
  SeasonalPricingFeature,
} from './features/index.js';

export type {
  FreshnessTrackingConfig,
  DeliveryOptimizationConfig,
  ExpirationAlertsConfig,
  SeasonalPricingConfig,
} from './features/index.js';

// Components
export {
  FreshnessTracker,
  DeliveryRouteOptimizer,
  ExpirationAlerts,
} from './components/index.js';

export type {
  FreshnessTrackerProps,
  FreshnessTrackerRecord,
  FreshnessStats,
  DeliveryRouteOptimizerProps,
  DeliveryRouteType,
  DeliveryStopType,
  RouteStats,
  ExpirationAlertsProps,
  ExpirationAlertType,
  ExpirationAlertStats,
} from './components/index.js';

// Dashboard
export * from './dashboard/index.js';
export { GroceryDashboard } from './components/GroceryDashboard.js';

// Types
export * from './types/index.js';

export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-grocery',
  version: VERSION,
  description: 'Vayva Grocery Industry Engine - Complete Grocery Management Platform',
  industries: ['grocery', 'supermarket', 'fresh-market', 'organic-store'],
} as const;