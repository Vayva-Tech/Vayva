/**
 * Constants Module
 * 
 * Centralized constants for plans, industries, features, and routes
 */

// Plans
export {
  PLANS,
  getPlanBySlug,
  hasFeature,
  getFeatureLimit,
  isLimitExceeded,
  getUpgradePath,
  type PlanType,
  type PlanDefinition,
  type PlanFeature,
} from './plans';

// Industries
export {
  INDUSTRIES,
  getIndustry,
  getAllIndustries,
  industrySupportsFeature,
  type IndustrySlug,
  type IndustryDefinition,
} from './industries';

// Features
export {
  FEATURE_FLAGS,
  isFeatureEnabled,
  getEnabledFeatures,
  type FeatureFlag,
} from './features';

// Routes
export {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  ADMIN_ROUTES,
  ALL_ROUTES,
  getRouteByPath,
  hasRouteAccess,
  getRoutesByCategory,
  getNavigationStructure,
  type RoutePermission,
  type RouteDefinition,
} from './routes';
