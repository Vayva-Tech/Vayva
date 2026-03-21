// ============================================================================
// Meal Kit Widget Registry
// ============================================================================

import { WidgetRegistry } from "@vayva/industry-core";
import { WeeklyRecipeSelector } from "./WeeklyRecipeSelector.js";
import { SubscriptionPlanBuilder } from "./SubscriptionPlanBuilder.js";
import { DeliverySlotPicker } from "./DeliverySlotPicker.js";
import { MealPreferenceTracker } from "./MealPreferenceTracker.js";
import { IngredientInventoryManager } from "./IngredientInventoryManager.js";

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
