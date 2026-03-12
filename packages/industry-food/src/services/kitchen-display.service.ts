/**
 * Kitchen Display Service
 * Kitchen display system (KDS) integration and order management
 */

import { prisma } from '@vayva/prisma';

export interface KDSOrder {
  id: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    status: 'pending' | 'preparing' | 'ready' | 'served';
    notes?: string;
  }>;
  createdAt: Date;
  targetTime: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export class KitchenDisplayService {
  async initialize() {
    console.log('[KitchenDisplayService] Initialized');
  }

  async getActiveOrders(businessId: string): Promise<KDSOrder[]> {
    const orders = await prisma.order.findMany({
      where: {
        businessId,
        status: { in: ['pending', 'confirmed', 'preparing'] },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map(item => ({
        name: item.menuItem?.name || 'Unknown Item',
        quantity: item.quantity,
        status: 'pending',
        notes: item.notes,
      })),
      createdAt: order.createdAt,
      targetTime: order.estimatedReadyTime || order.createdAt,
      status: order.status as any,
    }));
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed'): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
