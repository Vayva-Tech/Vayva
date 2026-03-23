// @ts-nocheck
// ============================================================================
// Retail Widget Registry
// ============================================================================
// Register retail-specific widgets with the dashboard engine
// ============================================================================

import { WidgetRegistry } from "@vayva/industry-core";
import { ListWidget, KPICardWidget, ChartWidget } from "@vayva/industry-core/widgets";

/**
 * Register all retail industry widgets
 */
export function registerRetailWidgets() {
  // Retail uses standard widgets from industry-core
  // No custom widgets needed for Phase 1
  
  // If you need custom retail widgets in the future:
  // WidgetRegistry.register('product-grid', ProductGridWidget);
  // WidgetRegistry.register('inventory-alert', InventoryAlertWidget);
  
  console.log("Retail widgets registered");
}
