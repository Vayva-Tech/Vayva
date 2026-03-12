// ============================================================================
// @vayva/industry-food - Main Exports
// ============================================================================
// Food/Restaurant industry dashboard package
// ============================================================================

// Main engine
export {
  FoodGroceryEngine,
  FoodGroceryEngineFactory,
  createDefaultFoodGroceryConfig,
  type FoodGroceryEngineConfig,
  type FoodGroceryFeatureId,
  type FoodGroceryEngineStatus,
} from './food-grocery.engine.js';

// Dashboard Configuration
export { foodDashboardConfig } from "./dashboard/config.js";
export type { DashboardEngineConfig } from "@vayva/industry-core";

// Components
export { FoodDashboard } from "./components/FoodDashboard.js";
export type { FoodDashboardProps } from "./components/FoodDashboard.js";
export * from './components/index.js';

// Widgets
export { KitchenDisplaySystem } from "./widgets/KitchenDisplaySystem.js";
export { EightySixBoard } from "./widgets/86Board.js";
export { registerFoodWidgets } from "./widgets/registry.js";

// Types
export type * from "./types/index.js";
