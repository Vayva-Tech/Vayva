/**
 * Kitchen Operations Feature
 * Manage kitchen workflow and order preparation
 */

import { z } from 'zod';

export const kitchenOrderSchema = z.object({
  orderId: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      specialInstructions: z.string().optional(),
      status: 'pending' | 'preparing' | 'ready' | 'served',
    })
  ),
  priority: 'normal' | 'rush' | 'vip',
  estimatedPrepTime: z.number(),
  station: 'hot' | 'cold' | 'grill' | 'fry' | 'pastry',
});

export type KitchenOrder = z.infer<typeof kitchenOrderSchema>;

export interface KitchenMetrics {
  averagePrepTime: number;
  ordersInQueue: number;
  onTimePercentage: number;
  stationWorkload: Record<string, number>;
}

export class KitchenOperationsFeature {
  private orderQueue: KitchenOrder[] = [];

  async addOrder(order: KitchenOrder): Promise<void> {
    this.orderQueue.push(order);
    // Sort by priority and time
    this.orderQueue.sort((a, b) => {
      const priorityOrder = { rush: 0, vip: 1, normal: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  async updateOrderStatus(orderId: string, status: KitchenOrder['items'][0]['status']): Promise<void> {
    const order = this.orderQueue.find(o => o.orderId === orderId);
    if (order) {
      order.items.forEach(item => {
        if (item.status === 'pending') {
          item.status = status;
        }
      });
    }
  }

  async getKitchenMetrics(): Promise<KitchenMetrics> {
    const ordersInQueue = this.orderQueue.length;
    
    // Simulated metrics
    const averagePrepTime = 15; // minutes
    const onTimePercentage = 92; // percentage
    
    const stationWorkload: Record<string, number> = {
      hot: this.orderQueue.filter(o => o.station === 'hot').length,
      cold: this.orderQueue.filter(o => o.station === 'cold').length,
      grill: this.orderQueue.filter(o => o.station === 'grill').length,
      fry: this.orderQueue.filter(o => o.station === 'fry').length,
      pastry: this.orderQueue.filter(o => o.station === 'pastry').length,
    };

    return {
      averagePrepTime,
      ordersInQueue,
      onTimePercentage,
      stationWorkload,
    };
  }

  async getNextOrders(station?: string): Promise<KitchenOrder[]> {
    if (station) {
      return this.orderQueue.filter(order => order.station === station);
    }
    return this.orderQueue.slice(0, 5); // Return next 5 orders
  }

  async completeOrder(orderId: string): Promise<void> {
    this.orderQueue = this.orderQueue.filter(o => o.orderId !== orderId);
  }
}
