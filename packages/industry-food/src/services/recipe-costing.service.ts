// @ts-nocheck
/**
 * Recipe Costing Service
 * Calculates recipe costs, food costing, and ingredient analysis
 */

import { prisma } from '@vayva/prisma';
import { z } from 'zod';

const recipeCostSchema = z.object({
  recipeId: z.string(),
  businessId: z.string(),
  ingredients: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.number(),
    unit: z.string(),
    cost: z.number(),
  })),
});

export interface RecipeCostResult {
  recipeId: string;
  totalCost: number;
  costPerPortion: number;
  portions: number;
  ingredients: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
}

export class RecipeCostingService {
  async initialize() {
    console.log('[RecipeCostingService] Initialized');
  }

  async calculateRecipeCost(recipeId: string, businessId: string): Promise<RecipeCostResult> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId, businessId },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                suppliers: true,
              },
            },
          },
        },
      },
    });

    if (!recipe) throw new Error('Recipe not found');

    const totalCost = recipe.ingredients.reduce((sum, item) => {
      return sum + (item.quantity * item.ingredient.costPerUnit);
    }, 0);

    const portions = recipe.portions || 1;
    const costPerPortion = totalCost / portions;

    return {
      recipeId,
      totalCost,
      costPerPortion,
      portions,
      ingredients: recipe.ingredients.map(i => ({
        name: i.ingredient.name,
        quantity: i.quantity,
        cost: i.quantity * i.ingredient.costPerUnit,
      })),
    };
  }

  async updateIngredientCost(ingredientId: string, newCost: number): Promise<void> {
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { costPerUnit: newCost },
    });
  }
}
