/**
 * Recipe Cost Calculator Types
 * Food Industry - Operational Excellence Tools
 */

export type IngredientCategory =
  | 'produce'
  | 'protein'
  | 'pantry'
  | 'dairy'
  | 'beverages'
  | 'spices'
  | 'other';

export type UnitType =
  | 'kg' | 'g' | 'mg'
  | 'l' | 'ml'
  | 'piece' | 'dozen'
  | 'cup' | 'tbsp' | 'tsp'
  | 'oz' | 'lb';

export interface Ingredient {
  id: string;
  storeId: string;
  name: string;
  unit: UnitType;
  costPerUnit: number;
  supplier: string | null;
  stockQty: number;
  minStock: number;
  category: IngredientCategory;
  shelfLifeDays: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  ingredient: Ingredient;
  quantity: number;
  isOptional: boolean;
  // Calculated fields
  costForQuantity: number;
}

export interface RecipeInstruction {
  step: number;
  description: string;
  duration?: number; // minutes
  temperature?: number; // celsius for cooking
}

export interface Recipe {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  menuItemId: string | null;
  portions: number;
  prepTime: number;
  cookTime: number;
  instructions: RecipeInstruction[];
  imageUrl: string | null;
  isActive: boolean;
  ingredients: RecipeIngredient[];
  // Calculated fields
  totalCost: number;
  costPerPortion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeCostHistory {
  id: string;
  recipeId: string;
  calculatedAt: Date;
  totalCost: number;
  costPerPortion: number;
  ingredientCosts: Record<string, {
    name: string;
    quantity: number;
    costPerUnit: number;
    total: number;
  }>;
}

export interface MenuItemPricing {
  id: string;
  menuItemId: string;
  recipeId: string | null;
  targetFoodCost: number; // percentage
  currentCost: number;
  suggestedPrice: number;
  actualPrice: number;
  grossMargin: number;
  profitPerPortion: number;
  lastUpdated: Date;
}

export interface CostAnalysis {
  recipeId: string;
  recipeName: string;
  currentCost: number;
  suggestedPrice: number;
  currentPrice: number | null;
  currentMargin: number | null;
  targetMargin: number;
  profitGap: number;
  recommendation: 'increase_price' | 'reduce_cost' | 'maintain' | 'no_menu_item';
  ingredientCostBreakdown: Array<{
    ingredientId: string;
    name: string;
    percentageOfTotal: number;
    cost: number;
  }>;
}

export interface IngredientStockAlert {
  ingredientId: string;
  name: string;
  currentStock: number;
  minStock: number;
  recipesAffected: string[];
  estimatedRunout: Date | null;
}

// API Request/Response types
export interface CreateIngredientRequest {
  name: string;
  unit: UnitType;
  costPerUnit: number;
  supplier?: string;
  stockQty?: number;
  minStock?: number;
  category: IngredientCategory;
  shelfLifeDays?: number;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  menuItemId?: string;
  portions?: number;
  prepTime: number;
  cookTime: number;
  instructions: RecipeInstruction[];
  imageUrl?: string;
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    isOptional?: boolean;
  }>;
}

export interface UpdateIngredientCostRequest {
  ingredientId: string;
  newCostPerUnit: number;
}
