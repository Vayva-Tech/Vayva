/**
 * @vayva/industry-restaurant - Unified Restaurant Industry Package
 * 
 * Complete restaurant industry solution including:
 * - FOH (Front of House) Dashboard Components
 * - KDS (Kitchen Display System) Components
 * - Backend Services (86 Board, KDS, Tables, Reservations, etc.)
 * - Restaurant Engine
 * - Recipe Costing
 * - Table Turn Optimization
 * - Labor Optimization
 */

// Main engine
export {
  RestaurantEngine,
  RestaurantEngineFactory,
  createDefaultRestaurantConfig,
  type RestaurantEngineConfig,
  type RestaurantFeatureId,
  type RestaurantEngineStatus,
} from './restaurant.engine';

// Types (includes kitchen-types via types/index)
export * from './types/index';

// Features (Backend Services)
export * from './features/index';

// Dashboard Configuration
export {
  RESTAURANT_DASHBOARD_CONFIG,
  KDS_WIDGET_CONFIG,
  TABLE_MAP_CONFIG,
  MENU_ENGINEERING_CONFIG,
  getRestaurantDashboardConfig,
} from './dashboard/restaurant-dashboard.config';

// FOH & KDS UI Components
export * from './components/index';

// Backend services: import `@vayva/industry-restaurant/services` to avoid duplicate
// symbols with feature modules (e.g. KDSService).
