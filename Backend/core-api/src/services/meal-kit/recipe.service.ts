// Backend/core-api/src/services/meal-kit/recipe.service.ts
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class MealKitRecipeService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a new recipe
   */
  async createRecipe(storeId: string, data: any) {
    try {
      const recipe = await this.db.mealKitRecipe.create({
        data: {
          ...data,
          storeId,
        },
      });
      
      logger.info('[MealKitRecipeService.createRecipe]', { 
        recipeId: recipe.id, 
        storeId 
      });
      
      return recipe;
    } catch (error) {
      logger.error('[MealKitRecipeService.createRecipe]', { storeId, error });
      throw error;
    }
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(id: string) {
    try {
      return await this.db.mealKitRecipe.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('[MealKitRecipeService.getRecipeById]', { id, error });
      throw error;
    }
  }

  /**
   * Get all recipes for a store
   */
  async getStoreRecipes(
    storeId: string,
    filters?: {
      category?: string;
      difficulty?: string;
      isAvailable?: boolean;
    }
  ) {
    try {
      const where: any = { storeId };

      if (filters) {
        if (filters.category) where.category = filters.category;
        if (filters.difficulty) where.difficulty = filters.difficulty;
        if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
      }

      return await this.db.mealKitRecipe.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('[MealKitRecipeService.getStoreRecipes]', { storeId, error });
      throw error;
    }
  }

  /**
   * Update recipe
   */
  async updateRecipe(id: string, data: any) {
    try {
      return await this.db.mealKitRecipe.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('[MealKitRecipeService.updateRecipe]', { id, error });
      throw error;
    }
  }

  /**
   * Delete recipe
   */
  async deleteRecipe(id: string) {
    try {
      await this.db.mealKitRecipe.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('[MealKitRecipeService.deleteRecipe]', { id, error });
      throw error;
    }
  }
}
