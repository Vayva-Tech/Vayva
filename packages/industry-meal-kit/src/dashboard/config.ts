// @ts-nocheck
// ============================================================================
// Meal Kit Dashboard Configuration
// ============================================================================

export interface MealKitDashboardConfig {
  widgets: string[];
  layout: 'grid' | 'list';
  refreshInterval: number;
}

export const MEAL_KIT_DASHBOARD_CONFIG: MealKitDashboardConfig = {
  widgets: [
    'weekly-recipe-selector',
    'subscription-plan-builder',
    'delivery-slot-picker',
    'meal-preference-tracker',
    'ingredient-inventory-manager',
  ],
  layout: 'grid',
  refreshInterval: 30000, // 30 seconds
};
