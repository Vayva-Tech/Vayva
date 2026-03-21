/**
 * Order Factory
 * Test data factory for Order entity
 */

import { prisma, type Order, type Prisma } from '@vayva/db';

export type OrderCreateInput = Partial<Prisma.OrderCreateInput> & {
  storeId: string;
  customerId?: string;
};

export class OrderFactory {
  private static counter = 0;

  static defaults(storeId: string, customerId?: string): Prisma.OrderCreateInput {
    this.counter++;
    const data: Prisma.OrderCreateInput = {
      orderNumber: `ORD-${Date.now()}-${this.counter}`,
      total: 50000, // 500.00 in cents
      status: 'PENDING',
      paymentStatus: 'PENDING',
      store: {
        connect: { id: storeId },
      },
    };

    if (customerId) {
      data.customer = {
        connect: { id: customerId },
      };
    }

    return data;
  }

  static create(overrides: OrderCreateInput): Promise<Order> {
    const { storeId, customerId, ...rest } = overrides;
    return prisma.order.create({
      data: {
        ...this.defaults(storeId, customerId),
        ...rest,
      },
    });
  }

  static createMany(
    count: number,
    storeId: string,
    customerId?: string,
    overrides: Omit<OrderCreateInput, 'storeId' | 'customerId'> = {}
  ): Promise<Order[]> {
    return Promise.all(
      Array(count)
        .fill(null)
        .map(() => this.create({ storeId, customerId, ...overrides }))
    );
  }

  static async cleanup(orderId: string): Promise<void> {
    await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  }

  static async cleanupByStore(storeId: string): Promise<void> {
    await prisma.order.deleteMany({
      where: {
        storeId,
      },
    });
  }
}
