// @ts-nocheck
/**
 * Food Industry Features
 * Core feature modules for food businesses
 */

export { RecipeCostingFeature } from './recipe-costing.feature';
export type { RecipeCostingData, RecipeCostingResult } from './recipe-costing.feature';
export { recipeCostingSchema } from './recipe-costing.feature';

export { MenuEngineeringFeature } from './menu-engineering.feature';
export type { MenuEngineeringData, MenuItemAnalysis } from './menu-engineering.feature';
export { menuEngineeringSchema } from './menu-engineering.feature';

export { KitchenOperationsFeature } from './kitchen-operations.feature';
export type { KitchenOrder, KitchenMetrics } from './kitchen-operations.feature';
export { kitchenOrderSchema } from './kitchen-operations.feature';

export { InventoryTrackingFeature } from './inventory-tracking.feature';
export type { InventoryItem, InventoryAlert } from './inventory-tracking.feature';
export { inventoryItemSchema } from './inventory-tracking.feature';
