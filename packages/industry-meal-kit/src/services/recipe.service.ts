// ============================================================================
// Recipe Service - PURE BUSINESS LOGIC ONLY (NO DATABASE)
// ============================================================================
// Note: Database operations moved to Backend/core-api/src/services/meal-kit/recipe.service.ts
// This service now contains only pure business logic functions

import { MealKitRecipeSchema, MealKitRecipeInput } from '../types';

export class RecipeCalculator {
  /**
   * Scale recipe ingredients by a factor
   */
  static scaleRecipe(recipe: any, scaleFactor: number) {
    return {
      ...recipe,
      ingredients: recipe.ingredients?.map((ing: any) => ({
        ...ing,
        quantity: ing.quantity * scaleFactor,
      })),
    };
  }

  /**
   * Calculate nutrition totals from ingredients
   */
  static calculateNutritionTotals(recipe: any) {
    // Pure calculation logic - no database access
    return recipe.ingredients?.reduce(
      (totals: any, ingredient: any) => {
        return {
          calories: totals.calories + (ingredient.nutrition?.calories || 0),
          protein: totals.protein + (ingredient.nutrition?.protein || 0),
          carbs: totals.carbs + (ingredient.nutrition?.carbs || 0),
          fat: totals.fat + (ingredient.nutrition?.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }
}

// Keep RecipeService for backward compatibility but remove database dependency
export class RecipeService {
  /**
   * @deprecated Use backend API instead: POST /api/v1/meal-kit/recipes
   */
  static validateRecipeInput(data: MealKitRecipeInput) {
    return MealKitRecipeSchema.parse(data);
  }
}

  /**
   * Create a new recipe
   */
  async createRecipe(data: MealKitRecipeInput) {
    const validatedData = MealKitRecipeSchema.parse(data);

    return this.prisma.mealKitRecipe.create({
      data: validatedData,
    });
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(id: string) {
    return this.prisma.mealKitRecipe.findUnique({
      where: { id },
    });
  }

  /**
   * Get all recipes for a store
   */
  async getStoreRecipes(storeId: string, filters?: {
    category?: string;
    difficulty?: string;
    isAvailable?: boolean;
  }) {
    const where: any = { storeId };

    if (filters) {
      if (filters.category) where.category = filters.category;
      if (filters.difficulty) where.difficulty = filters.difficulty;
      if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
    }

    return this.prisma.mealKitRecipe.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update recipe
   */
  async updateRecipe(id: string, data: Partial<MealKitRecipeInput>) {
    return this.prisma.mealKitRecipe.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete recipe
   */
  async deleteRecipe(id: string) {
    return this.prisma.mealKitRecipe.delete({
      where: { id },
    });
  }

  /**
   * Toggle recipe availability
   */
  async toggleAvailability(id: string): Promise<boolean> {
    const recipe = await this.getRecipeById(id);
    
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    await this.prisma.mealKitRecipe.update({
      where: { id },
      data: {
        isAvailable: !recipe.isAvailable,
      },
    });

    return !recipe.isAvailable;
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(storeId: string, category: string) {
    return this.prisma.mealKitRecipe.findMany({
      where: {
        storeId,
        category,
        isAvailable: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Search recipes
   */
  async searchRecipes(storeId: string, query: string) {
    return this.prisma.mealKitRecipe.findMany({
      where: {
        storeId,
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}
