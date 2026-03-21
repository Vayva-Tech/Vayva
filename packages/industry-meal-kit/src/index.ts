// ============================================================================
// Meal Kit Industry Package - Main Entry Point
// ============================================================================

// Core engine
export { MealKitEngine, mealKitEngine } from './meal-kit.engine.js';

// Dashboard configuration
export type { MealKitDashboardConfig } from './dashboard/config.js';
export { MEAL_KIT_DASHBOARD_CONFIG } from './dashboard/config.js';

// Components
export * from './components/index.js';

// Features
export * from './features/index.js';

// Services
export * from './services/index.js';

// Widgets
export { registerMealKitWidgets } from './widgets/registry.js';
export * from './widgets/index.js';

// Types
export * from './types/index.js';

// Re-export core types
export type {
  MealKitSubscription,
  WeeklyMenu,
  MealKitRecipe,
  CustomerMealPreference,
  DeliverySlot,
  MealKitPlanType,
} from '@prisma/client';
