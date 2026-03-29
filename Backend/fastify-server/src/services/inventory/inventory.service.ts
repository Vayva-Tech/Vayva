import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import type { InventoryItem, InventoryLocation, InventoryMovement } from '@vayva/db';

interface StockAdjustmentResult {
  onHand: number;
  available: number;
}

export class InventoryService {
  constructor(private readonly db = prisma) {}

  /**
   * Get or create the default inventory location for a store
   */
  async getDefaultLocation(storeId: string): Promise<InventoryLocation> {
    let location = await this.db.inventoryLocation.findFirst({
      where: { storeId, isDefault: true },
    });

    if (!location) {
      location = await this.db.inventoryLocation.findFirst({
        where: { storeId },
      });

      if (!location) {
        location = await this.db.inventoryLocation.create({
          data: {
            storeId,
            name: 'Main Warehouse',
            isDefault: true,
          },
        });
      }
    }

    return location;
  }

  /**
   * Adjust inventory quantity for a variant
   * Records an InventoryMovement with transaction safety
   */
  async adjustStock(
    storeId: string,
    variantId: string,
    productId: string,
    quantityChange: number,
    reason: string,
    actorId: string,
    locationId?: string,
  ): Promise<StockAdjustmentResult> {
    const location = locationId
      ? { id: locationId }
      : await this.getDefaultLocation(storeId);

    if (!location) {
      throw new Error('No inventory location found');
    }

    return await this.db.$transaction(async (tx) => {
      // 1. Get or create inventory item
      let item = await tx.inventoryItem.findUnique({
        where: {
          locationId_variantId: {
            locationId: location.id,
            variantId,
          },
        },
      });

      if (!item) {
        const newItem = await tx.inventoryItem.create({
          data: {
            locationId: location.id,
            variantId,
            productId,
            onHand: 0,
            available: 0,
          },
        });
        item = newItem;
      }

      // 2. Update stock levels
      const newOnHand = item.onHand + quantityChange;
      const newAvailable = item.available + quantityChange;

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          onHand: newOnHand,
          available: newAvailable,
        },
      });

      // 3. Log movement
      await tx.inventoryMovement.create({
        data: {
          storeId,
          locationId: location.id,
          variantId,
          type: quantityChange >= 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_SUB',
          quantity: quantityChange,
          reason,
          userId: actorId,
        },
      });

      logger.info(`[Inventory] Adjusted stock for variant ${variantId}: ${quantityChange} (${reason})`);

      return { onHand: newOnHand, available: newAvailable };
    });
  }

  /**
   * Get inventory history for a variant
   * Returns all movements sorted by date descending
   */
  async getHistory(storeId: string, variantId: string): Promise<InventoryMovement[]> {
    const history = await this.db.inventoryMovement.findMany({
      where: { storeId, variantId },
      orderBy: { createdAt: 'desc' },
      include: {
        inventoryLocation: true,
      },
    });

    return history;
  }
}
