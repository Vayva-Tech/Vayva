import { prisma } from "@/lib/db";
import type { InventoryItem as _InventoryItem, InventoryLocation, InventoryMovement } from "@vayva/db";
import { StockAdjustmentResult } from "@/types/inventory";

export class InventoryService {
  /**
   * Get or create the default inventory location for a store.
   */
  static async getDefaultLocation(storeId: string): Promise<InventoryLocation> {
    let location = await prisma.inventoryLocation.findFirst({
      where: { storeId, isDefault: true },
    });
    if (!location) {
      // Check if any location exists
      location = await prisma.inventoryLocation.findFirst({
        where: { storeId },
      });
      if (!location) {
        // Create default location
        location = await prisma.inventoryLocation.create({
          data: {
            storeId,
            name: "Main Warehouse",
            isDefault: true,
          },
        });
      }
    }
    return location;
  }
  /**
   * Adjust inventory quantity for a variant.
   * Records an InventoryMovement.
   */
  static async adjustStock(
    storeId: string,
    variantId: string,
    productId: string,
    quantityChange: number,
    reason: string,
    actorId: string,
    locationId?: string,
  ): Promise<StockAdjustmentResult> {
    const location: Pick<InventoryLocation, "id"> = locationId
      ? { id: locationId }
      : await this.getDefaultLocation(storeId);
    if (!location) throw new Error("No inventory location found");
    return await prisma.$transaction(async (tx) => {
      // 1. Get or Create inventoryItems
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
      // 3. Log Movement
      await tx.inventoryMovement.create({
        data: {
          storeId,
          locationId: location.id,
          variantId,
          type: quantityChange >= 0 ? "ADJUSTMENT_ADD" : "ADJUSTMENT_SUB",
          quantity: quantityChange,
          reason,
          userId: actorId,
        },
      });
      return { onHand: newOnHand, available: newAvailable };
    });
  }
  /**
   * Get inventory history for a variant.
   */
  static async getHistory(
    storeId: string,
    variantId: string,
  ): Promise<InventoryMovement[]> {
    const history = await prisma.inventoryMovement.findMany({
      where: { storeId, variantId },
      orderBy: { createdAt: "desc" },
      include: {
        inventoryLocation: true,
      },
    });
    return history;
  }
}
