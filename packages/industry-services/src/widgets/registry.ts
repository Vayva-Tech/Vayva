// @ts-nocheck
// ============================================================================
// Services Widget Registry
// ============================================================================
// Register services-specific widgets
// ============================================================================

import { WidgetRegistry } from "@vayva/industry-core";
import { CalendarWidget } from "@vayva/industry-core/widgets";

/**
 * Register all services industry widgets
 */
export function registerServicesWidgets() {
  // Register calendar widget for booking management
  WidgetRegistry.register("calendar", CalendarWidget);
  
  console.log("Services industry widgets registered");
}
