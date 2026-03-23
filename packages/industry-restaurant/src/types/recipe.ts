// @ts-nocheck
/**
 * Recipe Costing types
 * Menu engineering and cost analysis
 */

export interface RecipeCostConfig {
  ingredientPriceTracking: boolean;
  yieldCalculations: boolean;
  menuEngineering: boolean;
  marginAlerts: boolean;
  targetFoodCostPercentage: number;
  laborCostPerHour: number;
}

export interface RecipeCost {
  menuItemId: string;
  name: string;
  ingredients: IngredientCost[];
  laborCost: number;
  overheadAllocation: number;
  totalCost: number;
  suggestedPrice: number;
  currentPrice: number;
  margin: number;
  marginPercentage: number;
  foodCostPercentage: number;
  // Menu engineering classification
  classification: MenuItemClassification;
  popularityScore: number; // 0-100
  profitabilityScore: number; // 0-100
  // Sales data for menu engineering
  totalRevenue?: number;
  totalOrders?: number;
}

export interface IngredientCost {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  vendorId?: string;
  vendorName?: string;
  lastPriceUpdate: Date;
  priceTrend: 'up' | 'down' | 'stable';
}

export interface Recipe {
  id: string;
  menuItemId: string;
  name: string;
  description?: string;
  yield: number;
  yieldUnit: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  notes?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  prepNotes?: string;
  optional: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentCost: number;
  averageCost: number;
  vendorId?: string;
  vendorName?: string;
  parLevel: number;
  onHand: number;
  lastOrdered?: Date;
  priceHistory: PriceHistoryPoint[];
}

export interface PriceHistoryPoint {
  date: Date;
  price: number;
  vendorId?: string;
}

export type MenuItemClassification = 'star' | 'puzzle' | 'plowhorse' | 'dog';

export interface MenuEngineeringMatrix {
  stars: RecipeCost[];      // High profit, high popularity
  puzzles: RecipeCost[];    // High profit, low popularity
  plowhorses: RecipeCost[]; // Low profit, high popularity
  dogs: RecipeCost[];       // Low profit, low popularity
}

export interface MenuEngineeringRecommendation {
  menuItemId: string;
  currentClassification: MenuItemClassification;
  recommendedAction: 'promote' | 'reprice' | 'reformulate' | 'remove';
  reason: string;
  potentialImpact: number; // Estimated revenue impact
}

export interface RecipeMarginAlert {
  type: 'high-food-cost' | 'negative-margin' | 'price-increase' | 'vendor-change';
  menuItemId: string;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
}
