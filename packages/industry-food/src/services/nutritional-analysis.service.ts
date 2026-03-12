/**
 * Nutritional Analysis Service
 * Nutrition calculations and dietary information
 */

import { prisma } from '@vayva/prisma';

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export class NutritionalAnalysisService {
  async initialize() {
    console.log('[NutritionalAnalysisService] Initialized');
  }

  async calculateRecipeNutrition(recipeId: string): Promise<NutritionalInfo> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) throw new Error('Recipe not found');

    const totals = recipe.ingredients.reduce(
      (acc, item) => {
        const ing = item.ingredient;
        const multiplier = item.quantity;

        return {
          calories: acc.calories + (ing.caloriesPerUnit || 0) * multiplier,
          protein: acc.protein + (ing.proteinPerUnit || 0) * multiplier,
          carbohydrates: acc.carbs + (ing.carbsPerUnit || 0) * multiplier,
          fat: acc.fat + (ing.fatPerUnit || 0) * multiplier,
          fiber: acc.fiber + (ing.fiberPerUnit || 0) * multiplier,
          sodium: acc.sodium + (ing.sodiumPerUnit || 0) * multiplier,
        };
      },
      {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
      }
    );

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sodium: Math.round(totals.sodium),
    };
  }

  async getDietaryLabels(recipeId: string): Promise<string[]> {
    const nutrition = await this.calculateRecipeNutrition(recipeId);
    const labels: string[] = [];

    if (nutrition.calories < 300) labels.push('Low Calorie');
    if (nutrition.fat < 10) labels.push('Low Fat');
    if (nutrition.carbohydrates < 30) labels.push('Low Carb');
    if (nutrition.protein > 20) labels.push('High Protein');
    if (nutrition.fiber > 5) labels.push('High Fiber');
    if (nutrition.sodium < 140) labels.push('Low Sodium');

    return labels;
  }
}
