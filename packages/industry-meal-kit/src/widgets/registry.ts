// ============================================================================
// Meal Kit Widget Registry
// ============================================================================

import { getWidgetRegistry } from "@vayva/industry-core";
import { WeeklyRecipeSelector } from "./WeeklyRecipeSelector";
import { SubscriptionPlanBuilder } from "./SubscriptionPlanBuilder";
import { DeliverySlotPicker } from "./DeliverySlotPicker";
import { MealPreferenceTracker } from "./MealPreferenceTracker";
import { IngredientInventoryManager } from "./IngredientInventoryManager";

/**
 * Register all meal kit industry widgets
 */
export function registerMealKitWidgets() {
  const registry = getWidgetRegistry();
  registry.register("weekly-recipe-selector", WeeklyRecipeSelector as never);
  registry.register("subscription-plan-builder", SubscriptionPlanBuilder as never);
  registry.register("delivery-slot-picker", DeliverySlotPicker as never);
  registry.register("meal-preference-tracker", MealPreferenceTracker as never);
  registry.register(
    "ingredient-inventory-manager",
    IngredientInventoryManager as never
  );

  console.log("Meal kit industry widgets registered");
}
