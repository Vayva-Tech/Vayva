// @ts-nocheck
/**
 * Inventory Allocator Feature
 */

import { InventoryAllocatorService } from '../services/inventory-allocator.service.js';

export class InventoryAllocatorFeature {
  constructor(private service: InventoryAllocatorService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  allocateInventory(orderId: string, items: any[]) {
    return this.service.allocateInventory(orderId, items);
  }

  getInventoryStatus() {
    return this.service.getInventoryStatus();
  }

  getLowStockItems() {
    return this.service.getLowStockItems();
  }
}
