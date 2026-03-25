/**
 * Recipe Costing Feature
 * Calculate and optimize recipe costs for food businesses
 */

import { z } from 'zod';

export const recipeCostingSchema = z.object({
  recipeId: z.string(),
  recipeName: z.string(),
  servings: z.number().positive(),
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      costPerUnit: z.number().positive(),
      wastePercentage: z.number().min(0).max(100).optional(),
    })
  ),
  laborCost: z.number().nonnegative().optional(),
  overheadCost: z.number().nonnegative().optional(),
});

export type RecipeCostingData = z.infer<typeof recipeCostingSchema>;

export interface RecipeCostingResult {
  totalIngredientCost: number;
  costPerServing: number;
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
}

export class RecipeCostingFeature {
  async calculateCosts(data: RecipeCostingData): Promise<RecipeCostingResult> {
    const totalIngredientCost = data.ingredients.reduce((sum, ingredient) => {
      const wasteMultiplier = 1 + (ingredient.wastePercentage || 0) / 100;
      return sum + (ingredient.quantity * ingredient.costPerUnit * wasteMultiplier);
    }, 0);

    const laborCost = data.laborCost || 0;
    const overheadCost = data.overheadCost || 0;
    const totalCost = totalIngredientCost + laborCost + overheadCost;
    const costPerServing = totalCost / data.servings;

    // Suggested price with 30% profit margin
    const suggestedPrice = costPerServing / 0.7;
    const profitMargin = ((suggestedPrice - costPerServing) / suggestedPrice) * 100;

    return {
      totalIngredientCost,
      costPerServing,
      totalCost,
      suggestedPrice,
      profitMargin,
    };
  }

  async optimizeRecipe(data: RecipeCostingData): Promise<{ optimized: boolean; suggestions: string[] }> {
    const suggestions: string[] = [];
    
    // Find expensive ingredients
    const sortedIngredients = [...data.ingredients].sort((a, b) => 
      (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit)
    );

    if (sortedIngredients.length > 0) {
      const topCost = sortedIngredients[0];
      suggestions.push(`Consider alternatives for ${topCost.name} (highest cost contributor)`);
    }

    // Check for high waste percentages
    const highWaste = data.ingredients.filter(i => (i.wastePercentage || 0) > 10);
    if (highWaste.length > 0) {
      suggestions.push(`Reduce waste for: ${highWaste.map(i => i.name).join(', ')}`);
    }

    return {
      optimized: suggestions.length > 0,
      suggestions,
    };
  }
}
