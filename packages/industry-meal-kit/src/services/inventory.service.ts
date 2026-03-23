// @ts-nocheck
// ============================================================================
// Inventory Service
// ============================================================================

import { PrismaClient } from '@prisma/client';

export interface IngredientRequirement {
  productId: string;
  quantity: number;
  unit: string;
}

export class InventoryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate ingredients needed for subscriptions
   */
  async calculateIngredientRequirements(
    storeId: string,
    weekStartDate: Date,
    weekEndDate: Date
  ): Promise<IngredientRequirement[]> {
    // Get active subscriptions for the week
    const subscriptions = await this.prisma.mealKitSubscription.findMany({
      where: {
        storeId,
        status: 'active',
        nextDelivery: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
    });

    // Get weekly menu recipes
    const weeklyMenu = await this.prisma.weeklyMenu.findFirst({
      where: {
        storeId,
        weekStartDate,
        isActive: true,
      },
    });

    if (!weeklyMenu) {
      return [];
    }

    const recipes = weeklyMenu.recipes as any[] || [];
    
    // Aggregate ingredient requirements
    const ingredientMap = new Map<string, IngredientRequirement>();

    for (const subscription of subscriptions) {
      for (const recipe of recipes) {
        // Get recipe details to access ingredients
        const recipeDetails = await this.prisma.mealKitRecipe.findUnique({
          where: { id: recipe.recipeId },
        });

        if (recipeDetails) {
          const ingredients = recipeDetails.ingredients as any[];
          
          for (const ingredient of ingredients) {
            const key = `${ingredient.ingredientId}-${ingredient.unit}`;
            const existing = ingredientMap.get(key);
            
            if (existing) {
              existing.quantity += ingredient.quantity * subscription.portionsPerMeal;
            } else {
              ingredientMap.set(key, {
                productId: ingredient.ingredientId,
                quantity: ingredient.quantity * subscription.portionsPerMeal,
                unit: ingredient.unit,
              });
            }
          }
        }
      }
    }

    return Array.from(ingredientMap.values());
  }

  /**
   * Check stock levels for ingredients
   */
  async checkStockLevels(
    storeId: string,
    requirements: IngredientRequirement[]
  ): Promise<{ productId: string; inStock: boolean; availableQuantity?: number }[]> {
    const results = [];

    for (const requirement of requirements) {
      // Get product inventory
      const product = await this.prisma.product.findFirst({
        where: {
          id: requirement.productId,
          storeId,
        },
        include: {
          inventory: true,
        },
      });

      if (!product || !product.inventory) {
        results.push({
          productId: requirement.productId,
          inStock: false,
        });
        continue;
      }

      const availableQuantity = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      
      results.push({
        productId: requirement.productId,
        inStock: availableQuantity >= requirement.quantity,
        availableQuantity,
      });
    }

    return results;
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(storeId: string, threshold: number = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        storeId,
        inventory: {
          some: {
            quantity: { lte: threshold },
          },
        },
      },
      include: {
        inventory: {
          where: {
            quantity: { lte: threshold },
          },
        },
      },
    });

    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.inventory.reduce((sum, inv) => sum + inv.quantity, 0),
      threshold,
    }));
  }

  /**
   * Reserve inventory for meal kits
   */
  async reserveInventory(
    storeId: string,
    reservations: { productId: string; quantity: number; unit: string }[]
  ): Promise<boolean> {
    try {
      for (const reservation of reservations) {
        // Find inventory for this product
        const inventory = await this.prisma.inventory.findFirst({
          where: {
            productId: reservation.productId,
            storeId,
          },
        });

        if (!inventory || inventory.quantity < reservation.quantity) {
          return false;
        }

        // Decrement inventory
        await this.prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: { decrement: reservation.quantity },
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to reserve inventory:', error);
      return false;
    }
  }
}
