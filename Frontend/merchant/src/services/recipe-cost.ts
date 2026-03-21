/**
 * Recipe Cost Calculator Service
 * Food Industry - Operational Excellence Tools
 */

import { PrismaClient, Prisma } from '@vayva/db';
import type {
  Ingredient,
  Recipe,
  RecipeIngredient,
  CostAnalysis,
  MenuItemPricing,
  IngredientStockAlert,
  RecipeInstruction,
  CreateIngredientRequest,
  CreateRecipeRequest,
  UpdateIngredientCostRequest,
  UnitType,
  IngredientCategory,
} from '@/types/recipe-cost';

// Prisma Decimal type helper
type Decimal = { toNumber(): number } | number;

function toNumber(d: Decimal): number {
  return typeof d === 'number' ? d : d.toNumber();
}

export class RecipeCostService {
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  // ============================================================================
  // Ingredient Management
  // ============================================================================

  async createIngredient(
    storeId: string,
    data: CreateIngredientRequest
  ): Promise<Ingredient> {
    const ingredient = await this.db.ingredient.create({
      data: {
        storeId,
        name: data.name,
        unit: data.unit,
        costPerUnit: data.costPerUnit,
        supplier: data.supplier ?? null,
        stockQty: data.stockQty ?? 0,
        minStock: data.minStock ?? 0,
        category: data.category,
        shelfLifeDays: data.shelfLifeDays ?? null,
        isActive: true,
      },
    });

    return this.mapIngredient(ingredient);
  }

  async getIngredients(storeId: string, options?: { category?: string; isActive?: boolean }): Promise<Ingredient[]> {
    const ingredients = await this.db.ingredient.findMany({
      where: {
        storeId,
        ...(options?.category && { category: options.category }),
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      orderBy: { name: 'asc' },
    });

    return ingredients.map((i: any) => this.mapIngredient(i as any));
  }

  async updateIngredient(
    storeId: string,
    ingredientId: string,
    data: Partial<CreateIngredientRequest>
  ): Promise<Ingredient> {
    const ingredient = await this.db.ingredient.update({
      where: { id: ingredientId, storeId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.unit && { unit: data.unit }),
        ...(data.costPerUnit !== undefined && { costPerUnit: data.costPerUnit }),
        ...(data.supplier !== undefined && { supplier: data.supplier }),
        ...(data.stockQty !== undefined && { stockQty: data.stockQty }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
        ...(data.category && { category: data.category }),
        ...(data.shelfLifeDays !== undefined && { shelfLifeDays: data.shelfLifeDays }),
      },
    });

    return this.mapIngredient(ingredient);
  }

  async deleteIngredient(storeId: string, ingredientId: string): Promise<void> {
    // Check if ingredient is used in any recipes
    const usage = await this.db.recipeIngredient.findFirst({
      where: { ingredientId },
    });

    if (usage) {
      throw new Error('Cannot delete ingredient that is used in recipes');
    }

    await this.db.ingredient.delete({
      where: { id: ingredientId, storeId },
    });
  }

  // ============================================================================
  // Recipe Management
  // ============================================================================

  async createRecipe(
    storeId: string,
    data: CreateRecipeRequest
  ): Promise<Recipe> {
    const recipe = await this.db.recipe.create({
      data: {
        storeId,
        name: data.name,
        description: data.description ?? null,
        menuItemId: data.menuItemId ?? null,
        portions: data.portions ?? 1,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        instructions: data.instructions as unknown as Prisma.InputJsonValue,
        imageUrl: data.imageUrl ?? null,
        isActive: true,
        ingredients: {
          create: data.ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            isOptional: ing.isOptional ?? false,
          })),
        },
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    const calculated = await this.calculateRecipeCosts(recipe);
    await this.saveCostHistory(calculated);

    return calculated;
  }

  async getRecipes(storeId: string, options?: { isActive?: boolean; menuItemId?: string }): Promise<Recipe[]> {
    const recipes = await this.db.recipe.findMany({
      where: {
        storeId,
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
        ...(options?.menuItemId && { menuItemId: options.menuItemId }),
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return Promise.all(recipes.map((r) => this.calculateRecipeCosts(r)));
  }

  async getRecipeById(storeId: string, recipeId: string): Promise<Recipe | null> {
    const recipe = await this.db.recipe.findFirst({
      where: { id: recipeId, storeId },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    if (!recipe) return null;

    return this.calculateRecipeCosts(recipe);
  }

  async updateRecipe(
    storeId: string,
    recipeId: string,
    data: Partial<CreateRecipeRequest>
  ): Promise<Recipe> {
    // Handle ingredient updates if provided
    if (data.ingredients) {
      // Delete existing ingredients and recreate
      await this.db.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      await this.db.recipeIngredient.createMany({
        data: data.ingredients.map((ing: any) => ({
          recipeId,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          isOptional: ing.isOptional ?? false,
        })),
      });
    }

    const recipe = await this.db.recipe.update({
      where: { id: recipeId, storeId },
      data: {
        name: data.name,
        description: data.description,
        menuItemId: data.menuItemId,
        portions: data.portions,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        instructions: data.instructions ? (data.instructions as unknown as Prisma.InputJsonValue) : undefined,
        imageUrl: data.imageUrl,
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    const calculated = await this.calculateRecipeCosts(recipe);
    await this.saveCostHistory(calculated);

    return calculated;
  }

  async deleteRecipe(storeId: string, recipeId: string): Promise<void> {
    await this.db.recipe.delete({
      where: { id: recipeId, storeId },
    });
  }

  // ============================================================================
  // Cost Calculations
  // ============================================================================

  private async calculateRecipeCosts(recipe: RecipeWithIngredients): Promise<Recipe> {
    let totalCost = 0;
    const ingredientCosts: RecipeIngredient[] = [];

    for (const ri of recipe.ingredients) {
      const qty = toNumber(ri.quantity);
      const costPerUnit = toNumber(ri.ingredient.costPerUnit);
      const costForQuantity = qty * costPerUnit;
      totalCost += costForQuantity;

      ingredientCosts.push({
        id: ri.id,
        recipeId: ri.recipeId,
        ingredientId: ri.ingredientId,
        ingredient: this.mapIngredient(ri.ingredient),
        quantity: qty,
        isOptional: ri.isOptional,
        costForQuantity,
      });
    }

    const costPerPortion = totalCost / recipe.portions;

    return {
      id: recipe.id,
      storeId: recipe.storeId,
      name: recipe.name,
      description: recipe.description,
      menuItemId: recipe.menuItemId,
      portions: recipe.portions,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      instructions: recipe.instructions as unknown as RecipeInstruction[],
      imageUrl: recipe.imageUrl,
      isActive: recipe.isActive,
      ingredients: ingredientCosts,
      totalCost: Math.round(totalCost * 100) / 100,
      costPerPortion: Math.round(costPerPortion * 100) / 100,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  async getCostAnalysis(storeId: string): Promise<CostAnalysis[]> {
    const recipes = await this.db.recipe.findMany({
      where: { storeId, isActive: true },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
        menuItem: true,
      },
    });

    const analyses: CostAnalysis[] = [];

    for (const recipe of recipes) {
      const calculated = await this.calculateRecipeCosts(recipe);
      const pricing = await this.db.menuItemPricing.findUnique({
        where: { menuItemId: recipe.menuItemId ?? '' },
      });

      const currentPrice = recipe.menuItem?.price ? toNumber(recipe.menuItem.price) : null;
      const currentMargin = currentPrice
        ? ((currentPrice - calculated.costPerPortion) / currentPrice) * 100
        : null;

      const targetMargin = 30; // 30% default food cost target
      const suggestedPrice = Math.ceil(calculated.costPerPortion / (1 - targetMargin / 100) / 50) * 50; // Round to nearest 50

      const ingredientBreakdown = calculated.ingredients
        .filter((i: any) => !i.isOptional)
        .map((i: any) => ({
          ingredientId: i.ingredientId,
          name: i.ingredient.name,
          percentageOfTotal: Math.round((i.costForQuantity / calculated.totalCost) * 100 * 10) / 10,
          cost: i.costForQuantity,
        }))
        .sort((a: any, b: any) => b.percentageOfTotal - a.percentageOfTotal);

      let recommendation: CostAnalysis['recommendation'];
      if (!currentPrice) {
        recommendation = 'no_menu_item';
      } else if (currentMargin !== null && currentMargin < targetMargin - 5) {
        recommendation = 'increase_price';
      } else if (currentMargin !== null && currentMargin > targetMargin + 10) {
        recommendation = 'maintain';
      } else {
        recommendation = 'reduce_cost';
      }

      analyses.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        currentCost: calculated.costPerPortion,
        suggestedPrice,
        currentPrice,
        currentMargin,
        targetMargin,
        profitGap: currentPrice ? suggestedPrice - currentPrice : 0,
        recommendation,
        ingredientCostBreakdown: ingredientBreakdown,
      });
    }

    return analyses.sort((a: any, b: any) => b.profitGap - a.profitGap);
  }

  async getStockAlerts(storeId: string): Promise<IngredientStockAlert[]> {
    const ingredients = await this.db.ingredient.findMany({
      where: {
        storeId,
        isActive: true,
        stockQty: { lte: this.db.ingredient.fields.minStock },
      },
      include: {
        recipes: {
          where: { recipe: { isActive: true } },
          include: { recipe: true },
        },
      },
    });

    const alerts: IngredientStockAlert[] = [];

    for (const ingredient of ingredients) {
      // Calculate daily usage rate based on recipe associations
      const recipesAffected = ingredient.recipes.map((r) => r.recipe);
      let totalDailyUsage = 0;
      
      // Estimate usage: count how many active recipes use this ingredient
      // and divide by 30 days for a rough daily estimate
      if (recipesAffected.length > 0) {
        // Assume each recipe is ordered ~5 times per month on average
        // This is a placeholder - real implementation would need order data linkage
        totalDailyUsage = recipesAffected.length * 0.17; // 5 orders / 30 days
      }

      const stockQty = toNumber(ingredient.stockQty);
      const daysUntilRunout = totalDailyUsage > 0
        ? stockQty / totalDailyUsage
        : null;

      alerts.push({
        ingredientId: ingredient.id,
        name: ingredient.name,
        currentStock: stockQty,
        minStock: toNumber(ingredient.minStock),
        recipesAffected: ingredient.recipes.map((r) => r.recipe.name),
        estimatedRunout: daysUntilRunout !== null
          ? new Date(Date.now() + daysUntilRunout * 24 * 60 * 60 * 1000)
          : null,
      });
    }

    return alerts.sort((a: any, b: any) => (a.estimatedRunout?.getTime() ?? Infinity) - (b.estimatedRunout?.getTime() ?? Infinity));
  }

  async updateIngredientCosts(
    storeId: string,
    updates: UpdateIngredientCostRequest[]
  ): Promise<void> {
    for (const update of updates) {
      await this.db.ingredient.update({
        where: { id: update.ingredientId, storeId },
        data: { costPerUnit: update.newCostPerUnit },
      });
    }

    // Recalculate all affected recipes
    const affectedRecipes = await this.db.recipe.findMany({
      where: {
        storeId,
        ingredients: {
          some: {
            ingredientId: { in: updates.map((u: any) => u.ingredientId) },
          },
        },
      },
      include: {
        ingredients: { include: { ingredient: true } },
      },
    });

    for (const recipe of affectedRecipes) {
      const calculated = await this.calculateRecipeCosts(recipe);
      await this.saveCostHistory(calculated);
    }
  }

  async getCostHistory(recipeId: string, limit = 10): Promise<RecipeCostHistory[]> {
    const history = await this.db.recipeCostHistory.findMany({
      where: { recipeId },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
    });

    return history.map((h) => ({
      id: h.id,
      recipeId: h.recipeId,
      calculatedAt: h.calculatedAt,
      totalCost: toNumber(h.totalCost),
      costPerPortion: toNumber(h.costPerPortion),
      ingredientCosts: h.ingredientCosts as RecipeCostHistory['ingredientCosts'],
    }));
  }

  // ============================================================================
  // Menu Item Pricing
  // ============================================================================

  async updateMenuItemPricing(
    storeId: string,
    menuItemId: string,
    data: {
      targetFoodCost?: number;
      actualPrice?: number;
      recipeId?: string;
    }
  ): Promise<MenuItemPricing> {
    // Get current cost from recipe if available
    let currentCost = 0;
    if (data.recipeId) {
      const recipe = await this.getRecipeById(storeId, data.recipeId);
      if (recipe) {
        currentCost = recipe.costPerPortion;
      }
    }

    const targetFoodCost = data.targetFoodCost ?? 30;
    const suggestedPrice = Math.ceil(currentCost / (1 - targetFoodCost / 100) / 50) * 50;
    const actualPrice = data.actualPrice ?? suggestedPrice;
    const grossMargin = ((actualPrice - currentCost) / actualPrice) * 100;
    const profitPerPortion = actualPrice - currentCost;

    const pricing = await this.db.menuItemPricing.upsert({
      where: { menuItemId },
      create: {
        menuItemId,
        recipeId: data.recipeId ?? null,
        targetFoodCost,
        currentCost,
        suggestedPrice,
        actualPrice,
        grossMargin,
        profitPerPortion,
      },
      update: {
        ...(data.recipeId && { recipeId: data.recipeId }),
        ...(data.targetFoodCost && { targetFoodCost }),
        ...(data.actualPrice && { actualPrice }),
        currentCost,
        suggestedPrice,
        grossMargin,
        profitPerPortion,
      },
    });

    return {
      id: pricing.id,
      menuItemId: pricing.menuItemId,
      recipeId: pricing.recipeId,
      targetFoodCost: toNumber(pricing.targetFoodCost),
      currentCost: toNumber(pricing.currentCost),
      suggestedPrice: toNumber(pricing.suggestedPrice),
      actualPrice: toNumber(pricing.actualPrice),
      grossMargin: toNumber(pricing.grossMargin),
      profitPerPortion: toNumber(pricing.profitPerPortion),
      lastUpdated: pricing.lastUpdated,
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async saveCostHistory(recipe: Recipe): Promise<void> {
    const ingredientCosts: Record<string, unknown> = {};
    recipe.ingredients.forEach((i: RecipeIngredient) => {
      ingredientCosts[i.ingredientId] = {
        name: i.ingredient.name,
        quantity: i.quantity,
        costPerUnit: i.ingredient.costPerUnit,
        total: i.costForQuantity,
      };
    });

    await this.db.recipeCostHistory.create({
      data: {
        recipeId: recipe.id,
        totalCost: recipe.totalCost,
        costPerPortion: recipe.costPerPortion,
        ingredientCosts: ingredientCosts as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private mapIngredient(ingredient: IngredientDb): Ingredient {
    return {
      id: ingredient.id,
      storeId: ingredient.storeId,
      name: ingredient.name,
      unit: ingredient.unit as UnitType,
      costPerUnit: toNumber(ingredient.costPerUnit),
      supplier: ingredient.supplier,
      stockQty: toNumber(ingredient.stockQty),
      minStock: toNumber(ingredient.minStock),
      category: ingredient.category as IngredientCategory,
      shelfLifeDays: ingredient.shelfLifeDays,
      isActive: ingredient.isActive,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }
}

// Type aliases for Prisma types
type IngredientDb = {
  id: string;
  storeId: string;
  name: string;
  unit: string;
  costPerUnit: Decimal;
  supplier: string | null;
  stockQty: Decimal;
  minStock: Decimal;
  category: string;
  shelfLifeDays: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type RecipeWithIngredients = {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  menuItemId: string | null;
  portions: number;
  prepTime: number;
  cookTime: number;
  instructions: Prisma.JsonValue;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Array<{
    id: string;
    recipeId: string;
    ingredientId: string;
    quantity: Decimal;
    isOptional: boolean;
    ingredient: IngredientDb;
  }>;
  menuItem?: { price: Decimal | null } | null;
};

type RecipeCostHistory = {
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
};
