import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Inventory Service - Backend
 * Manages inventory levels, adjustments, and movements
 */
export class InventoryService {
  constructor(private readonly db = prisma) {}

  /**
   * Get stock level for a product variant
   */
  async getStock(storeId: string, variantId: string, locationId?: string) {
    const where: any = {
      variantId,
      inventoryLocation: { storeId },
    };
    if (locationId) where.locationId = locationId;

    const item = await this.db.inventoryItem.findFirst({
      where,
      include: { inventoryLocation: true },
    });

    if (!item) return null;

    const onHand = item.onHand ?? 0;
    const reserved = item.reserved ?? 0;
    const lowStockThreshold = item.lowStockThreshold ?? 5;
    const reorderPoint = item.reorderPoint ?? 10;

    return {
      productId: item.productId,
      variantId: item.variantId,
      locationId: item.locationId,
      storeId,
      onHand,
      reserved,
      available: Math.max(0, onHand - reserved),
      reorderPoint,
      lowStockThreshold,
      isLowStock: onHand <= lowStockThreshold && onHand > 0,
      isOutOfStock: onHand <= 0,
      lastUpdatedAt: item.updatedAt,
    };
  }

  /**
   * Get stock across all locations for a variant
   */
  async getMultiLocationStock(storeId: string, variantId: string) {
    const items = await this.db.inventoryItem.findMany({
      where: {
        variantId,
        inventoryLocation: { storeId },
      },
      include: { inventoryLocation: true },
    });

    return items.map((item) => ({
      locationId: item.locationId,
      locationName: item.inventoryLocation.name,
      onHand: item.onHand ?? 0,
      reserved: item.reserved ?? 0,
      available: Math.max(0, (item.onHand ?? 0) - (item.reserved ?? 0)),
    }));
  }

  /**
   * List all variants with low/out-of-stock for a store
   */
  async getLowStockItems(storeId: string, threshold?: number) {
    const items = await this.db.inventoryItem.findMany({
      where: {
        inventoryLocation: { storeId },
      },
      include: { inventoryLocation: true },
    });

    const results: any[] = [];

    for (const item of items) {
      const lowThreshold = threshold ?? item.lowStockThreshold ?? 5;
      const onHand = item.onHand ?? 0;
      if (onHand <= lowThreshold) {
        const reserved = item.reserved ?? 0;
        results.push({
          productId: item.productId,
          variantId: item.variantId,
          locationId: item.locationId,
          storeId,
          onHand,
          reserved,
          available: Math.max(0, onHand - reserved),
          reorderPoint: item.reorderPoint ?? 10,
          lowStockThreshold: lowThreshold,
          isLowStock: onHand <= lowThreshold && onHand > 0,
          isOutOfStock: onHand <= 0,
          lastUpdatedAt: item.updatedAt,
        });
      }
    }

    return results;
  }

  /**
   * Adjust stock quantity (atomic with movement log)
   */
  async adjustStock(adjustment: any) {
    const { storeId, variantId, locationId, delta, reason, reference, productId } = adjustment;

    try {
      const result = await this.db.$transaction(async (tx: any) => {
        // Find inventory item
        const where: any = {
          variantId,
          inventoryLocation: { storeId },
        };
        if (locationId) where.locationId = locationId;

        const existing = await tx.inventoryItem.findFirst({ where });

        if (!existing) {
          if (delta < 0) {
            return { success: false, error: 'Cannot reduce stock for non-existent item' };
          }

          // Look up default location for store
          const location = await tx.inventoryLocation.findFirst({
            where: { storeId },
          });
          if (!location) {
            return { success: false, error: 'No inventory location found for store' };
          }

          await tx.inventoryItem.create({
            data: {
              productId,
              variantId,
              locationId: location.id,
              onHand: delta,
              reserved: 0,
              available: delta,
            },
          });

          await tx.inventoryMovement.create({
            data: {
              storeId,
              locationId: location.id,
              variantId,
              type: 'in',
              quantity: delta,
              reason,
              referenceId: reference,
            },
          });

          return { success: true, newBalance: delta };
        }

        const balanceBefore = existing.onHand ?? 0;
        const newBalance = balanceBefore + delta;

        if (newBalance < 0) {
          return {
            success: false,
            error: `Insufficient stock. Current: ${balanceBefore}, requested: ${delta}`,
          };
        }

        await tx.inventoryItem.update({
          where: { id: existing.id },
          data: {
            onHand: newBalance,
            available: Math.max(0, newBalance - (existing.reserved ?? 0)),
          },
        });

        await tx.inventoryMovement.create({
          data: {
            storeId,
            locationId: existing.locationId,
            variantId,
            type: delta > 0 ? 'in' : 'out',
            quantity: Math.abs(delta),
            reason,
            referenceId: reference,
          },
        });

        return { success: true, newBalance };
      }, { isolationLevel: 'Serializable' });

      return result;
    } catch (error) {
      logger.error('[Inventory] Adjust failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Deplete stock on order fulfillment
   */
  async depleteOnOrder(storeId: string, items: any[]) {
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.adjustStock({
        storeId,
        productId: item.productId,
        variantId: item.variantId,
        delta: -item.quantity,
        reason: 'sale',
        reference: item.orderId,
      });

      if (!result.success) {
        errors.push(`${item.variantId} - ${result.error}`);
      }
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * Receive stock (purchase order)
   */
  async receiveStock(storeId: string, items: any[]) {
    let received = 0;
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.adjustStock({
        storeId,
        productId: item.productId,
        variantId: item.variantId,
        locationId: item.locationId,
        delta: item.quantity,
        reason: 'purchase',
        reference: item.reference,
      });

      if (result.success) {
        received++;
      } else {
        errors.push(`${item.variantId} - ${result.error}`);
      }
    }

    return { received, errors };
  }

  /**
   * Transfer stock between locations
   */
  async transferStock(
    storeId: string,
    data: {
      fromLocationId: string;
      toLocationId: string;
      productId: string;
      variantId: string;
      quantity: number;
      note?: string;
    }
  ) {
    const deduct = await this.adjustStock({
      storeId,
      productId: data.productId,
      variantId: data.variantId,
      locationId: data.fromLocationId,
      delta: -data.quantity,
      reason: 'transfer',
      reference: `to:${data.toLocationId}`,
    });

    if (!deduct.success) {
      throw new Error(`Transfer failed: ${deduct.error}`);
    }

    await this.adjustStock({
      storeId,
      productId: data.productId,
      variantId: data.variantId,
      locationId: data.toLocationId,
      delta: data.quantity,
      reason: 'transfer',
      reference: `from:${data.fromLocationId}`,
    });

    return {
      id: `xfer-${Date.now()}`,
      storeId,
      fromLocationId: data.fromLocationId,
      toLocationId: data.toLocationId,
      productId: data.productId,
      variantId: data.variantId,
      quantity: data.quantity,
      status: 'received',
      requestedAt: new Date(),
      completedAt: new Date(),
      note: data.note,
    };
  }

  /**
   * Bulk cycle count: reconcile physical stock
   */
  async cycleCount(storeId: string, counts: any[]) {
    const variances: any[] = [];
    let adjusted = 0;

    for (const count of counts) {
      const current = await this.getStock(storeId, count.variantId, count.locationId);
      const expected = current?.onHand ?? 0;
      const delta = count.physicalCount - expected;

      if (delta !== 0) {
        const result = await this.adjustStock({
          storeId,
          productId: count.productId,
          variantId: count.variantId,
          locationId: count.locationId,
          delta,
          reason: 'cycle_count',
          reference: `count:${Date.now()}`,
        });

        if (result.success) {
          adjusted++;
          variances.push({
            variantId: count.variantId,
            expected,
            actual: count.physicalCount,
            delta,
          });
        }
      }
    }

    return { adjusted, variances };
  }

  /**
   * Get movement history for a variant
   */
  async getMovementHistory(storeId: string, variantId: string, options?: any) {
    const where: any = { storeId, variantId };
    if (options?.locationId) where.locationId = options.locationId;
    if (options?.since) where.createdAt = { gte: options.since };

    const logs = await this.db.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
    });

    return logs.map((log: any) => ({
      id: log.id,
      storeId: log.storeId,
      variantId: log.variantId,
      locationId: log.locationId,
      type: log.type,
      quantity: log.quantity,
      reason: log.reason ?? undefined,
      referenceId: log.referenceId ?? undefined,
      createdAt: log.createdAt,
    }));
  }
}
