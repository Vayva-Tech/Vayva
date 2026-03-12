import { db } from "@/lib/db";
import { mustUpdateScoped } from "@/lib/db/safe-update";

const KITCHEN_ORDER_STATUSES = [
  "UNFULFILLED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

type KitchenOrderStatus = (typeof KITCHEN_ORDER_STATUSES)[number];

function isKitchenOrderStatus(value: unknown): value is KitchenOrderStatus {
  return (
    typeof value === "string" &&
    (KITCHEN_ORDER_STATUSES as readonly string[]).includes(value)
  );
}

class KitchenServiceManager {
  maxConcurrentOrders: number;
  averagePrepTime: number;

  constructor() {
    // Config
    this.maxConcurrentOrders = 20;
    this.averagePrepTime = 15; // minutes
  }
  /**
   * Fetches active orders for the kitchen (Unfulfilled or Preparing)
   */
  async getOrders(storeId: string) {
    return await db.order.findMany({
      where: {
        storeId,
        fulfillmentStatus: { in: ["UNFULFILLED", "PREPARING"] },
        paymentStatus: { in: ["SUCCESS", "VERIFIED"] },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc", // FIFO
      },
    });
  }
  /**
   * Updates order status from the kitchen
   */
  async updateStatus(orderId: string, status: unknown, storeId: string) {
    if (!isKitchenOrderStatus(status)) {
      throw new Error("Invalid kitchen status");
    }

    // READY -> READY_FOR_PICKUP or SHIPPED
    // PREPARING -> PREPARING
    // 1. Update Order
    await mustUpdateScoped(
      db.order.updateMany({
        where: { id: orderId, storeId },
        data: {
          fulfillmentStatus: status,
        },
      }),
      "Order not found or access denied",
    );

    const updatedOrder = await db.order.findFirst({
      where: { id: orderId, storeId },
    });

    // 2. Log Timeline Event
    await db.orderTimelineEvent.create({
      data: {
        orderId,
        title: `Kitchen Update: ${status}`,
        body: `Order status changed to ${status} by kitchen display system.`,
      },
    });
    return updatedOrder;
  }
  /**
   * Fetches daily kitchen metrics
   */
  async getMetrics(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    // 1. Basic Counts
    const ordersToday = await db.order.count({
      where: {
        storeId,
        createdAt: { gte: today },
      },
    });
    const ordersInQueue = await db.order.count({
      where: {
        storeId,
        fulfillmentStatus: { in: ["UNFULFILLED", "PREPARING"] },
      },
    });
    // 2. Throughput (Orders completed in last hour)
    const throughput = await db.order.count({
      where: {
        storeId,
        fulfillmentStatus: {
          in: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"],
        },
        updatedAt: { gte: oneHourAgo },
      },
    });
    // 3. Avg Prep Time (Simple Estimate from today's completed orders)
    // In a real high-scale system, this would be pre-calculated or cached.
    const completedOrdersToday = await db.order.findMany({
      where: {
        storeId,
        fulfillmentStatus: {
          in: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"],
        },
        createdAt: { gte: today },
      },
      select: {
        createdAt: true,
        updatedAt: true,
        timelineEvents: {
          where: { title: { contains: "PREPARING" } },
          take: 1,
        },
      },
      take: 100, // Sample size limit for performance
    });
    let totalPrepTimeMinutes = 0;
    let countedOrders = 0;
    for (const order of completedOrdersToday) {
      // Use explicit "PREPARING" event if available, otherwise assume created -> fulfilled
      const events = order.timelineEvents;
      const startTime =
        events && events[0] ? events[0].createdAt : order.createdAt;
      const endTime = order.updatedAt;
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffMins = diffMs / 1000 / 60;
      if (diffMins > 0 && diffMins < 480) {
        // Filter anomalies > 8 hours
        totalPrepTimeMinutes += diffMins;
        countedOrders++;
      }
    }
    const avgPrepTime =
      countedOrders > 0
        ? Math.round(totalPrepTimeMinutes / countedOrders)
        : this.averagePrepTime; // Fallback to config default if no data
    return {
      ordersToday,
      ordersInQueue,
      avgPrepTime,
      throughput,
    };
  }
  async checkCapacity(storeId: string) {
    const activeOrders = await db.order.count({
      where: {
        storeId,
        fulfillmentStatus: { in: ["UNFULFILLED", "PREPARING"] },
      },
    });

    const remainingSlots = Math.max(this.maxConcurrentOrders - activeOrders, 0);
    const queueOverflow = Math.max(activeOrders - this.maxConcurrentOrders, 0);

    return {
      allowed: activeOrders < this.maxConcurrentOrders,
      waitTime: this.averagePrepTime + queueOverflow * 5,
      activeOrders,
      remainingSlots,
    };
  }
}
// Global Singleton
export const KitchenService = new KitchenServiceManager();
