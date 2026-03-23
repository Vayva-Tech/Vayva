// @ts-nocheck
// ============================================================================
// Meal Kit Industry Package - Main Entry Point
// ============================================================================

// Core engine
export { MealKitEngine, mealKitEngine } from './meal-kit.engine';

// Dashboard configuration
export type { MealKitDashboardConfig } from './dashboard/config';
export { MEAL_KIT_DASHBOARD_CONFIG } from './dashboard/config';

// Components
export * from './components/index';

// Features
export * from './features/index';

// Services
export * from './services/index';

// Widgets
export { registerMealKitWidgets } from './widgets/registry';
export * from './widgets/index';

// Types
export * from './types/index';

// Re-export core types
export type {
  MealKitSubscription,
  WeeklyMenu,
  MealKitRecipe,
  CustomerMealPreference,
  DeliverySlot,
  MealKitPlanType,
} from '@prisma/client';
