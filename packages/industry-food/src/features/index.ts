/**
 * Food Industry Features
 * Core feature modules for food businesses
 */

export { RecipeCostingFeature } from './recipe-costing.feature.js';
export type { RecipeCostingData, RecipeCostingResult } from './recipe-costing.feature.js';
export { recipeCostingSchema } from './recipe-costing.feature.js';

export { MenuEngineeringFeature } from './menu-engineering.feature.js';
export type { MenuEngineeringData, MenuItemAnalysis } from './menu-engineering.feature.js';
export { menuEngineeringSchema } from './menu-engineering.feature.js';

export { KitchenOperationsFeature } from './kitchen-operations.feature.js';
export type { KitchenOrder, KitchenMetrics } from './kitchen-operations.feature.js';
export { kitchenOrderSchema } from './kitchen-operations.feature.js';

export { InventoryTrackingFeature } from './inventory-tracking.feature.js';
export type { InventoryItem, InventoryAlert } from './inventory-tracking.feature.js';
export { inventoryItemSchema } from './inventory-tracking.feature.js';
