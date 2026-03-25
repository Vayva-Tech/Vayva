/**
 * Inventory Tracking Feature
 * Track and manage food inventory with expiration monitoring
 */

import { z } from 'zod';

export const inventoryItemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.number(),
  unit: z.string(),
  minQuantity: z.number(),
  maxQuantity: z.number(),
  supplier: z.string(),
  costPerUnit: z.number(),
  expirationDate: z.string().optional(),
  storageLocation: z.string(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export interface InventoryAlert {
  type: 'low-stock' | 'overstock' | 'expiring' | 'expired';
  itemId: string;
  itemName: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

export class InventoryTrackingFeature {
  private inventory: Map<string, InventoryItem> = new Map();
  private alerts: InventoryAlert[] = [];

  async addItem(item: InventoryItem): Promise<void> {
    this.inventory.set(item.itemId, item);
    await this.checkAlerts(item);
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    const item = this.inventory.get(itemId);
    if (item) {
      item.quantity = quantity;
      await this.checkAlerts(item);
    }
  }

  async checkAlerts(item: InventoryItem): Promise<void> {
    // Remove existing alerts for this item
    this.alerts = this.alerts.filter(a => a.itemId !== item.itemId);

    // Check low stock
    if (item.quantity <= item.minQuantity) {
      this.alerts.push({
        type: 'low-stock',
        itemId: item.itemId,
        itemName: item.name,
        message: `Low stock: ${item.name} (${item.quantity} ${item.unit})`,
        urgency: item.quantity <= item.minQuantity / 2 ? 'high' : 'medium',
      });
    }

    // Check overstock
    if (item.quantity > item.maxQuantity) {
      this.alerts.push({
        type: 'overstock',
        itemId: item.itemId,
        itemName: item.name,
        message: `Overstocked: ${item.name}`,
        urgency: 'low',
      });
    }

    // Check expiration
    if (item.expirationDate) {
      const daysUntilExpiration = Math.ceil(
        (new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration < 0) {
        this.alerts.push({
          type: 'expired',
          itemId: item.itemId,
          itemName: item.name,
          message: `EXPIRED: ${item.name}`,
          urgency: 'high',
        });
      } else if (daysUntilExpiration <= 3) {
        this.alerts.push({
          type: 'expiring',
          itemId: item.itemId,
          itemName: item.name,
          message: `Expiring soon: ${item.name} (${daysUntilExpiration} days)`,
          urgency: 'high',
        });
      } else if (daysUntilExpiration <= 7) {
        this.alerts.push({
          type: 'expiring',
          itemId: item.itemId,
          itemName: item.name,
          message: `Use soon: ${item.name} (${daysUntilExpiration} days)`,
          urgency: 'medium',
        });
      }
    }
  }

  async getAlerts(urgency?: string): Promise<InventoryAlert[]> {
    if (urgency) {
      return this.alerts.filter(a => a.urgency === urgency);
    }
    return this.alerts;
  }

  async getInventoryValue(): Promise<number> {
    let total = 0;
    this.inventory.forEach(item => {
      total += item.quantity * item.costPerUnit;
    });
    return total;
  }

  async getItemsToReorder(): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values()).filter(
      item => item.quantity <= item.minQuantity
    );
  }
}
