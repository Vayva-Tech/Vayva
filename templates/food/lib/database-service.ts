/**
 * Database Integration for Restaurant Services
 * 
 * This file provides Prisma client integration for the @vayva/industry-kitchen services.
 * It connects the in-memory services to actual database persistence.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: Import from generated Prisma client once restaurant schema is merged
// import { PrismaClient } from '@prisma/client';

// Using any for now until Prisma schema is updated
type PrismaClient = any;

const PrismaClientConstructor: any = null;

// Singleton Prisma Client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientConstructor({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Database adapter for KDS Service
 */
export class KdsDatabaseAdapter {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createKitchenOrder(orderData: {
    merchantId: string;
    orderNumber: string;
    course: string;
    priority: string;
    station: string;
    items: Array<{
      menuItemId: string;
      name: string;
      quantity: number;
      station: string;
      course: string;
      notes?: string;
    }>;
    serverName?: string;
    tableNumber?: string;
    guestCount?: number;
    specialInstructions?: string;
    allergies?: string[];
  }) {
    return this.prisma.kitchenOrder.create({
      data: {
        merchantId: orderData.merchantId,
        orderNumber: orderData.orderNumber,
        course: orderData.course,
        priority: orderData.priority,
        station: orderData.station,
        serverName: orderData.serverName,
        tableNumber: orderData.tableNumber,
        guestCount: orderData.guestCount,
        specialInstructions: orderData.specialInstructions,
        allergies: orderData.allergies || [],
        items: {
          create: orderData.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            status: 'pending',
            station: item.station,
            course: item.course,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async getActiveOrders(merchantId: string, status?: string[]) {
    return this.prisma.kitchenOrder.findMany({
      where: {
        merchantId,
        status: status ? { in: status } : undefined,
      },
      include: {
        items: true,
      },
      orderBy: {
        receivedAt: 'desc',
      },
    });
  }

  async updateOrderStatus(orderId: string, status: string, updates?: Record<string, any>) {
    return this.prisma.kitchenOrder.update({
      where: { id: orderId },
      data: {
        status,
        ...updates,
      },
      include: {
        items: true,
      },
    });
  }

  async startOrder(orderId: string) {
    return this.prisma.kitchenOrder.update({
      where: { id: orderId },
      data: {
        status: 'preparing',
        startedAt: new Date(),
      },
    });
  }

  async completeOrder(orderId: string) {
    return this.prisma.kitchenOrder.update({
      where: { id: orderId },
      data: {
        status: 'ready',
        readyAt: new Date(),
      },
    });
  }

  async bumpOrder(orderId: string, minutes: number) {
    return this.prisma.kitchenOrder.update({
      where: { id: orderId },
      data: {
        bumpedAt: new Date(),
      },
    });
  }
}

/**
 * Database adapter for Restaurant Dashboard Service
 */
export class RestaurantDatabaseAdapter {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getRevenueMetrics(merchantId: string, startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        merchantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['completed', 'served'],
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    
    const previousOrders = await this.prisma.order.findMany({
      where: {
        merchantId,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
        status: {
          in: ['completed', 'served'],
        },
      },
      select: {
        total: true,
      },
    });

    const previousRevenue = previousOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      revenue: totalRevenue,
      revenueChange,
      orderCount: orders.length,
    };
  }

  async getOperationalMetrics(merchantId: string) {
    const activeOrders = await this.prisma.order.count({
      where: {
        merchantId,
        status: {
          in: ['pending', 'confirmed', 'preparing', 'cooking'],
        },
      },
    });

    const avgPrepTime = await this.prisma.kitchenOrder.aggregate({
      where: {
        merchantId,
        prepTimeMinutes: {
          not: null,
        },
      },
      _avg: {
        prepTimeMinutes: true,
      },
    });

    const tableTurnRate = await this.prisma.tableReservation.groupBy({
      by: ['tableId'],
      where: {
        merchantId,
        status: 'completed',
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      _count: {
        id: true,
      },
    });

    return {
      activeOrders,
      avgPrepTime: avgPrepTime._avg.prepTimeMinutes || 0,
      tableTurns: tableTurnRate.reduce((sum: number, t: any) => sum + t._count.id, 0),
    };
  }
}

// Export singleton instances
export const kdsDbAdapter = new KdsDatabaseAdapter(prisma);
export const restaurantDbAdapter = new RestaurantDatabaseAdapter(prisma);
