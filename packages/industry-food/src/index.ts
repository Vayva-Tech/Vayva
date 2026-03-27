// ============================================================================
// @vayva/industry-food - Main Exports
// ============================================================================
// Food/Restaurant industry dashboard package
// ============================================================================

// Main engine - Temporarily disabled for build
// export {
//   FoodGroceryEngine,
//   FoodGroceryEngineFactory,
//   createDefaultFoodGroceryConfig,
//   type FoodGroceryEngineConfig,
//   type FoodGroceryFeatureId,
//   type FoodGroceryEngineStatus,
// } from './food-grocery.engine';

// Dashboard Configuration
export { foodDashboardConfig } from "./dashboard/config";
export type { DashboardEngineConfig } from "@vayva/industry-core";

// Components
export { FoodDashboard } from "./components/FoodDashboard";
export type { FoodDashboardProps } from "./components/FoodDashboard";
export * from './components/index';

// Widgets
export { KitchenDisplaySystem } from "./widgets/KitchenDisplaySystem";
export { EightySixBoard } from "./widgets/86Board";
export { registerFoodWidgets } from "./widgets/registry";

// Types
export type * from "./types/index";
