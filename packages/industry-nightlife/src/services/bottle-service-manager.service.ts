// @ts-nocheck
/**
 * Bottle Service Manager Service
 * Manages premium bottle service orders and inventory
 */

import { z } from 'zod';

export interface BottleServiceOrder {
  id: string;
  tableId: string;
  customerId: string;
  bottles: BottleOrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'completed';
  createdAt: Date;
  servedAt?: Date;
  specialRequests?: string;
}

export interface BottleOrderItem {
  bottleId: string;
  brand: string;
  type: 'vodka' | 'whiskey' | 'champagne' | 'tequila' | 'rum' | 'gin';
  tier: 'well' | 'call' | 'premium' | 'ultra-premium';
  quantity: number;
  pricePerBottle: number;
  mixers?: string[];
}

export interface BottleInventory {
  bottleId: string;
  brand: string;
  type: BottleOrderItem['type'];
  tier: BottleOrderItem['tier'];
  quantityInStock: number;
  reorderLevel: number;
  costPerBottle: number;
  sellingPrice: number;
}

export interface BottleServiceConfig {
  enableInventoryTracking?: boolean;
  autoSuggestMixers?: boolean;
  trackPourCost?: boolean;
}

const BottleOrderItemSchema = z.object({
  bottleId: z.string(),
  brand: z.string(),
  type: z.enum(['vodka', 'whiskey', 'champagne', 'tequila', 'rum', 'gin']),
  tier: z.enum(['well', 'call', 'premium', 'ultra-premium']),
  quantity: z.number().min(1),
  pricePerBottle: z.number().min(0),
  mixers: z.array(z.string()).optional(),
});

export class BottleServiceManagerService {
  private orders: Map<string, BottleServiceOrder>;
  private inventory: Map<string, BottleInventory>;
  private config: BottleServiceConfig;

  constructor(config: BottleServiceConfig = {}) {
    this.config = {
      enableInventoryTracking: true,
      autoSuggestMixers: true,
      trackPourCost: true,
      ...config,
    };
    this.orders = new Map();
    this.inventory = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[BOTTLE_SERVICE] Initializing service...');
    
    // Initialize sample inventory
    this.initializeInventory();
    
    console.log('[BOTTLE_SERVICE] Service initialized');
  }

  private initializeInventory(): void {
    const sampleBottles: BottleInventory[] = [
      { bottleId: 'b1', brand: 'Grey Goose', type: 'vodka', tier: 'premium', quantityInStock: 24, reorderLevel: 6, costPerBottle: 25, sellingPrice: 75 },
      { bottleId: 'b2', brand: 'Don Julio 1942', type: 'whiskey', tier: 'ultra-premium', quantityInStock: 12, reorderLevel: 3, costPerBottle: 80, sellingPrice: 250 },
      { bottleId: 'b3', brand: 'Dom Pérignon', type: 'champagne', tier: 'ultra-premium', quantityInStock: 18, reorderLevel: 4, costPerBottle: 120, sellingPrice: 450 },
      { bottleId: 'b4', brand: 'Patron Silver', type: 'tequila', tier: 'premium', quantityInStock: 20, reorderLevel: 5, costPerBottle: 30, sellingPrice: 95 },
    ];

    sampleBottles.forEach(bottle => this.inventory.set(bottle.bottleId, bottle));
  }

  createOrder(orderData: Partial<BottleServiceOrder>): BottleServiceOrder {
    const order: BottleServiceOrder = {
      ...orderData,
      id: orderData.id || `bso_${Date.now()}`,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date(),
      totalAmount: orderData.totalAmount || this.calculateTotal(orderData.bottles || []),
    } as BottleServiceOrder;

    this.orders.set(order.id, order);
    
    // Deduct from inventory
    if (this.config.enableInventoryTracking && order.bottles) {
      this.deductInventory(order.bottles);
    }

    return order;
  }

  private calculateTotal(bottles: BottleOrderItem[]): number {
    return bottles.reduce((sum, item) => sum + (item.pricePerBottle * item.quantity), 0);
  }

  private deductInventory(bottles: BottleOrderItem[]): void {
    bottles.forEach(item => {
      const inv = this.inventory.get(item.bottleId);
      if (inv) {
        inv.quantityInStock -= item.quantity;
      }
    });
  }

  updateOrderStatus(orderId: string, status: BottleServiceOrder['status']): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.status = status;
    if (status === 'served') {
      order.servedAt = new Date();
    }
    return true;
  }

  getLowStockItems(): BottleInventory[] {
    return Array.from(this.inventory.values()).filter(
      item => item.quantityInStock <= item.reorderLevel
    );
  }

  getOrderStatistics(eventId?: string): {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topSellingType: string;
  } {
    const orders = Array.from(this.orders.values());
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Calculate top selling type
    const typeCount = new Map<string, number>();
    orders.forEach(order => {
      order.bottles.forEach(bottle => {
        typeCount.set(bottle.type, (typeCount.get(bottle.type) || 0) + bottle.quantity);
      });
    });

    const topType = Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue: Math.round(revenue * 100) / 100,
      averageOrderValue: orders.length > 0 ? Math.round((revenue / orders.length) * 100) / 100 : 0,
      topSellingType: topType,
    };
  }

  getInventoryValue(): number {
    return Array.from(this.inventory.values()).reduce(
      (sum, item) => sum + (item.costPerBottle * item.quantityInStock), 
      0
    );
  }
}
