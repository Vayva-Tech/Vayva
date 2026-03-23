// @ts-nocheck
// ============================================================================
// Food Industry Widget Registry
// ============================================================================
// Register food/restaurant-specific widgets
// ============================================================================

import { WidgetRegistry } from "@vayva/industry-core";
import { KitchenDisplaySystem } from "./KitchenDisplaySystem";
import { EightySixBoard } from "./86Board";

/**
 * Register all food industry widgets
 */
export function registerFoodWidgets() {
  // Register custom restaurant widgets
  WidgetRegistry.register("kds-board", KitchenDisplaySystem);
  WidgetRegistry.register("86-board", EightySixBoard);
  
  console.log("Food industry widgets registered");
}
