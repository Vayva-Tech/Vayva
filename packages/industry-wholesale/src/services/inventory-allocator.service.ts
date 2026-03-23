// @ts-nocheck
/**
 * Inventory Allocator Service
 * Manages inventory allocation for wholesale orders
 */

import { z } from 'zod';

export interface InventoryItem {
  productId: string;
  available: number;
  reserved: number;
  incoming?: number;
  warehouseLocation?: string;
}

export interface Allocation {
  id: string;
  orderId: string;
  items: AllocationItem[];
  status: 'allocated' | 'picked' | 'packed' | 'shipped';
  createdAt: Date;
}

export interface AllocationItem {
  productId: string;
  quantity: number;
  warehouseLocation?: string;
}

export interface InventoryConfig {
  lowStockThreshold?: number;
  enableAutoAllocate?: boolean;
}

const AllocationSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    warehouseLocation: z.string().optional(),
  })),
  status: z.enum(['allocated', 'picked', 'packed', 'shipped']),
  createdAt: z.date(),
});

export class InventoryAllocatorService {
  private inventory: Map<string, InventoryItem>;
  private allocations: Map<string, Allocation>;
  private config: InventoryConfig;

  constructor(config: InventoryConfig = {}) {
    this.config = {
      lowStockThreshold: 10,
      enableAutoAllocate: true,
      ...config,
    };
    this.inventory = new Map();
    this.allocations = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[INVENTORY_ALLOCATOR] Initializing service...');
    
    // Initialize with sample inventory
    this.updateInventory('prod_1', 100, 10);
    this.updateInventory('prod_2', 50, 5);
    this.updateInventory('prod_3', 200, 20);

    console.log('[INVENTORY_ALLOCATOR] Service initialized');
  }

  updateInventory(productId: string, available: number, reserved: number = 0): void {
    this.inventory.set(productId, {
      productId,
      available,
      reserved,
    });
  }

  checkAvailability(productId: string, quantity: number): boolean {
    const item = this.inventory.get(productId);
    return !!item && item.available >= quantity;
  }

  allocateInventory(orderId: string, items: AllocationItem[]): Allocation | null {
    // Check availability first
    for (const item of items) {
      if (!this.checkAvailability(item.productId, item.quantity)) {
        return null; // Insufficient inventory
      }
    }

    // Create allocation
    const allocation: Allocation = {
      id: `alloc_${Date.now()}`,
      orderId,
      items,
      status: 'allocated',
      createdAt: new Date(),
    };

    // Reduce available inventory
    for (const item of items) {
      const inv = this.inventory.get(item.productId);
      if (inv) {
        inv.available -= item.quantity;
        inv.reserved += item.quantity;
      }
    }

    this.allocations.set(allocation.id, allocation);
    return allocation;
  }

  releaseAllocation(allocationId: string): boolean {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) return false;

    // Return inventory
    for (const item of allocation.items) {
      const inv = this.inventory.get(item.productId);
      if (inv) {
        inv.available += item.quantity;
        inv.reserved -= item.quantity;
      }
    }

    this.allocations.delete(allocationId);
    return true;
  }

  getLowStockItems(): InventoryItem[] {
    return Array.from(this.inventory.values()).filter(
      item => item.available <= this.config.lowStockThreshold!
    );
  }

  getInventoryStatus(): {
    totalProducts: number;
    totalAvailable: number;
    totalReserved: number;
    lowStockCount: number;
  } {
    const items = Array.from(this.inventory.values());
    return {
      totalProducts: items.length,
      totalAvailable: items.reduce((sum, i) => sum + i.available, 0),
      totalReserved: items.reduce((sum, i) => sum + i.reserved, 0),
      lowStockCount: items.filter(i => i.available <= this.config.lowStockThreshold!).length,
    };
  }
}
