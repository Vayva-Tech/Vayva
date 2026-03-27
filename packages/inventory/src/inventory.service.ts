/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Inventory Service - PURE BUSINESS LOGIC ONLY (NO DATABASE)
 * Database operations moved to Backend/core-api/src/services/inventory/inventory.service.ts
 */
import { z } from "zod";

// ────────────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────────────

export const AdjustmentSchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  locationId: z.string().optional(),
  delta: z.number().int(), // positive = add, negative = remove
  reason: z.enum([
    "sale",
    "return",
    "purchase",
    "damage",
    "theft",
    "adjustment",
    "transfer",
    "cycle_count",
  ]),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export type InventoryAdjustment = z.infer<typeof AdjustmentSchema>;

export interface StockLevel {
  productId: string;
  variantId: string;
  locationId: string;
  storeId: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lastUpdatedAt: Date;
}

export interface InventoryMovementRecord {
  id: string;
  storeId: string;
  variantId: string;
  locationId: string;
  type: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
  createdAt: Date;
}

export interface MultiLocationStock {
  locationId: string;
  locationName: string;
  onHand: number;
  reserved: number;
  available: number;
}

export interface StockTransfer {
  id: string;
  storeId: string;
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  variantId: string;
  quantity: number;
  status: "pending" | "in_transit" | "received" | "cancelled";
  requestedAt: Date;
  completedAt?: Date;
  note?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Service - Frontend Version (Calls Backend API)
// ────────────────────────────────────────────────────────────────────────────

/**
 * InventoryService - Frontend
 * Calls backend API for all database operations
 */
export class InventoryService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * Get stock level for a product variant via backend API
   */
  async getStock(
    storeId: string,
    variantId: string,
    locationId?: string
  ): Promise<StockLevel | null> {
    const url = `${this.apiBaseUrl}/inventory/stock/${variantId}?locationId=${locationId || ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${storeId}`,
      },
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data;
  }

  /**
   * Get stock across all locations for a variant
   */
  async getMultiLocationStock(
    storeId: string,
    variantId: string
  ): Promise<MultiLocationStock[]> {
    const items = await prisma.inventoryItem.findMany({
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
  async getLowStockItems(
    storeId: string,
    threshold?: number
  ): Promise<StockLevel[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        inventoryLocation: { storeId },
      },
      include: { inventoryLocation: true },
    });

    const results: StockLevel[] = [];

    for (const item of items) {
      const lowThreshold = threshold ?? (item as any).lowStockThreshold ?? 5;
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

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Adjust stock quantity (atomic with movement log)
   */
  async adjustStock(adjustment: InventoryAdjustment): Promise<{
    success: boolean;
    newBalance?: number;
    error?: string;
  }> {
    const parsed = AdjustmentSchema.safeParse(adjustment);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    const { storeId, variantId, locationId, delta, reason, reference } = parsed.data;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Find inventory item
        const where: Record<string, unknown> = {
          variantId,
          inventoryLocation: { storeId },
        };
        if (locationId) where.locationId = locationId;

        const existing = await tx.inventoryItem.findFirst({ where });

        if (!existing) {
          if (delta < 0) {
            return { success: false, error: "Cannot reduce stock for non-existent item" };
          }

          // Look up default location for store
          const location = await tx.inventoryLocation.findFirst({
            where: { storeId },
          });
          if (!location) {
            return { success: false, error: "No inventory location found for store" };
          }

          // InventoryItem requires variantId (non-nullable) - safe here
          await tx.inventoryItem.create({
            data: {
              productId: parsed.data.productId,
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
              type: "in",
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
            type: delta > 0 ? "in" : "out",
            quantity: Math.abs(delta),
            reason,
            referenceId: reference,
          },
        });

        return { success: true, newBalance };
      }, { isolationLevel: "Serializable" });

      return result;
    } catch (error) {
      console.error("[Inventory] Adjust failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Deplete stock on order fulfillment
   */
  async depleteOnOrder(
    storeId: string,
    items: Array<{ productId: string; variantId: string; quantity: number; orderId: string }>
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.adjustStock({
        storeId,
        productId: item.productId,
        variantId: item.variantId,
        delta: -item.quantity,
        reason: "sale",
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
  async receiveStock(
    storeId: string,
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      locationId?: string;
      reference?: string;
    }>
  ): Promise<{ received: number; errors: string[] }> {
    let received = 0;
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.adjustStock({
        storeId,
        productId: item.productId,
        variantId: item.variantId,
        locationId: item.locationId,
        delta: item.quantity,
        reason: "purchase",
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
  ): Promise<StockTransfer> {
    const deduct = await this.adjustStock({
      storeId,
      productId: data.productId,
      variantId: data.variantId,
      locationId: data.fromLocationId,
      delta: -data.quantity,
      reason: "transfer",
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
      reason: "transfer",
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
      status: "received",
      requestedAt: new Date(),
      completedAt: new Date(),
      note: data.note,
    };
  }

  /**
   * Bulk cycle count: reconcile physical stock
   */
  async cycleCount(
    storeId: string,
    counts: Array<{
      productId: string;
      variantId: string;
      locationId?: string;
      physicalCount: number;
    }>
  ): Promise<{
    adjusted: number;
    variances: Array<{ variantId: string; expected: number; actual: number; delta: number }>;
  }> {
    const variances: Array<{
      variantId: string;
      expected: number;
      actual: number;
      delta: number;
    }> = [];
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
          reason: "cycle_count",
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
  async getMovementHistory(
    storeId: string,
    variantId: string,
    options?: { locationId?: string; limit?: number; since?: Date }
  ): Promise<InventoryMovementRecord[]> {
    const where: Record<string, unknown> = { storeId, variantId };
    if (options?.locationId) where.locationId = options.locationId;
    if (options?.since) where.createdAt = { gte: options.since };

    const logs = await prisma.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
    });

    return logs.map((log) => ({
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

// Export singleton
export const inventoryService = new InventoryService();
