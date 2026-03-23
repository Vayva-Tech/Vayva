// @ts-nocheck
// ============================================================================
// Meal Kit Widget Registry
// ============================================================================

import { WidgetRegistry } from "@vayva/industry-core";
import { WeeklyRecipeSelector } from "./WeeklyRecipeSelector";
import { SubscriptionPlanBuilder } from "./SubscriptionPlanBuilder";
import { DeliverySlotPicker } from "./DeliverySlotPicker";
import { MealPreferenceTracker } from "./MealPreferenceTracker";
import { IngredientInventoryManager } from "./IngredientInventoryManager";

/**
 * Register all meal kit industry widgets
 */
export function registerMealKitWidgets() {
  // Register meal kit specific widgets
  WidgetRegistry.register("weekly-recipe-selector", WeeklyRecipeSelector);
  WidgetRegistry.register("subscription-plan-builder", SubscriptionPlanBuilder);
  WidgetRegistry.register("delivery-slot-picker", DeliverySlotPicker);
  WidgetRegistry.register("meal-preference-tracker", MealPreferenceTracker);
  WidgetRegistry.register("ingredient-inventory-manager", IngredientInventoryManager);
  
  console.log("Meal kit industry widgets registered");
}
