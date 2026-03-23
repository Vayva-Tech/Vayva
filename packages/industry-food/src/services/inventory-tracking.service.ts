// @ts-nocheck
/**
 * Inventory Tracking Service
 * Ingredient inventory management and tracking
 */

import { prisma } from '@vayva/prisma';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  currentStock: number;
  needsRestock: boolean;
}

export class InventoryTrackingService {
  async initialize() {
    console.log('[InventoryTrackingService] Initialized');
  }

  async getInventory(businessId: string): Promise<InventoryItem[]> {
    const ingredients = await prisma.ingredient.findMany({
      where: { businessId },
      include: {
        stockLevels: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    return ingredients.map(ing => {
      const currentStock = ing.stockLevels[0]?.quantity || 0;
      const needsRestock = currentStock <= ing.minStockLevel;

      return {
        id: ing.id,
        name: ing.name,
        quantity: currentStock,
        unit: ing.unit,
        minStock: ing.minStockLevel,
        currentStock,
        needsRestock,
      };
    });
  }

  async updateStock(ingredientId: string, quantity: number): Promise<void> {
    await prisma.stockLevel.create({
      data: {
        ingredientId,
        quantity,
        updatedAt: new Date(),
      },
    });
  }

  async getLowStockItems(businessId: string): Promise<InventoryItem[]> {
    const inventory = await this.getInventory(businessId);
    return inventory.filter(item => item.needsRestock);
  }
}
