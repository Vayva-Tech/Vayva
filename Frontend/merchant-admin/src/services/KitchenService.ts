/**
 * Kitchen Display System (KDS) Service
 * Manages kitchen orders for food service merchants
 */
export interface KitchenOrder {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes?: string;
  }>;
  status: "pending" | "preparing" | "ready" | "completed";
  priority: "normal" | "high" | "urgent";
  createdAt: Date;
  estimatedReadyAt?: Date;
}

export class KitchenService {
  /**
   * Fetch active kitchen orders for a store
   */
  static async getOrders(storeId: string): Promise<KitchenOrder[]> {
    const res = await fetch(`/api/kitchen/orders?storeId=${storeId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch kitchen orders: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Update kitchen order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: KitchenOrder["status"]
  ): Promise<{ success: boolean }> {
    const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error(`Failed to update order status: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Get kitchen performance metrics
   */
  static async getMetrics(storeId: string): Promise<{
    ordersToday: number;
    ordersInQueue: number;
    avgPrepTime: number;
    throughput: number;
  }> {
    const res = await fetch(`/api/kitchen/metrics?storeId=${storeId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch kitchen metrics: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Check kitchen capacity status
   */
  static async checkCapacity(storeId: string): Promise<{
    allowed: boolean;
    waitTime: number;
    activeOrders: number;
    remainingSlots: number;
  }> {
    const res = await fetch(`/api/kitchen/capacity?storeId=${storeId}`);
    if (!res.ok) {
      throw new Error(`Failed to check kitchen capacity: ${res.statusText}`);
    }
    return res.json();
  }
}
