import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class KitchenService {
  constructor(private readonly db = prisma) {}

  async getOrders(storeId: string, status?: string) {
    const orders = await this.db.order.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
            productVariant: {
              select: {
                title: true,
              },
            },
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      customerName: o.customer
        ? `${o.customer.firstName} ${o.customer.lastName}`
        : 'Guest',
      customerEmail: o.customer?.email,
      customerPhone: o.customer?.phone,
      items: o.items.map((item) => ({
        id: item.id,
        productName: item.product?.title || 'Unknown',
        variantName: item.productVariant?.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        notes: item.notes,
        metadata: item.metadata,
      })),
      notes: o.notes,
      metadata: o.metadata,
      createdAt: o.createdAt,
    }));
  }

  async getMetrics(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [ordersToday, ordersInQueue, throughput, completedOrders] = await Promise.all([
      this.db.order.count({
        where: { storeId, createdAt: { gte: today } },
      }),
      this.db.order.count({
        where: {
          storeId,
          fulfillmentStatus: { in: ['UNFULFILLED', 'PREPARING'] },
        },
      }),
      this.db.order.count({
        where: {
          storeId,
          fulfillmentStatus: {
            in: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
          },
          updatedAt: { gte: oneHourAgo },
        },
      }),
      this.db.order.findMany({
        where: {
          storeId,
          fulfillmentStatus: {
            in: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
          },
          createdAt: { gte: today },
        },
        select: {
          createdAt: true,
          updatedAt: true,
          timelineEvents: {
            where: { title: { contains: 'PREPARING' } },
            take: 1,
          },
        },
        take: 100,
      }),
    ]);

    let totalPrepTimeMinutes = 0;
    let countedOrders = 0;
    for (const order of completedOrders) {
      const events = order.timelineEvents;
      const startTime = events && events[0] ? events[0].createdAt : order.createdAt;
      const endTime = order.updatedAt;
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffMins = diffMs / 1000 / 60;
      if (diffMins > 0 && diffMins < 480) {
        totalPrepTimeMinutes += diffMins;
        countedOrders++;
      }
    }

    const avgPrepTime =
      countedOrders > 0
        ? Math.round(totalPrepTimeMinutes / countedOrders)
        : 15;

    return {
      ordersToday,
      ordersInQueue,
      avgPrepTime,
      throughput,
    };
  }

  async checkCapacity(storeId: string) {
    const maxConcurrentOrders = 20;
    const averagePrepTime = 15;

    const activeOrders = await this.db.order.count({
      where: {
        storeId,
        fulfillmentStatus: { in: ['UNFULFILLED', 'PREPARING'] },
      },
    });

    const remainingSlots = Math.max(maxConcurrentOrders - activeOrders, 0);
    const queueOverflow = Math.max(activeOrders - maxConcurrentOrders, 0);

    return {
      allowed: activeOrders < maxConcurrentOrders,
      waitTime: averagePrepTime + queueOverflow * 5,
      activeOrders,
      remainingSlots,
    };
  }
}
