/**
 * Food & Beverage Services
 */

// Traditional Services
export { RecipeCostingService } from './recipe-costing.service.js';
export type { RecipeCostResult } from './recipe-costing.service.js';

export { MenuEngineeringService } from './menu-engineering.service.js';
export type { MenuItemAnalysis } from './menu-engineering.service.js';

export { KitchenDisplayService } from './kitchen-display.service.js';
export type { KDSOrder } from './kitchen-display.service.js';

export { InventoryTrackingService } from './inventory-tracking.service.js';
export type { InventoryItem } from './inventory-tracking.service.js';

export { NutritionalAnalysisService } from './nutritional-analysis.service.js';
export type { NutritionalInfo } from './nutritional-analysis.service.js';

// AI-Powered Services
export { RecipeOptimizationService } from './recipe-optimization.service.js';
export type { RecipeOptimizationInput } from './recipe-optimization.service.js';

export { MenuEngineeringService as AIMenuEngineeringService } from './menu-engineering-ai.service.js';
export type { MenuEngineeringInput } from './menu-engineering-ai.service.js';

export { InventoryPredictionService } from './inventory-prediction.service.js';
export type { InventoryPredictionInput } from './inventory-prediction.service.js';
