/**
 * Kitchen Display Service
 * Kitchen display system (KDS) integration and order management
 */

import { prisma } from '@vayva/db';

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

function toKdsOrderStatus(raw: string): KDSOrder['status'] {
  if (raw === 'completed') return 'completed';
  if (raw === 'preparing' || raw === 'confirmed' || raw === 'in-progress') {
    return 'in-progress';
  }
  return 'pending';
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

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.menuItem?.name || 'Unknown Item',
        quantity: item.quantity,
        status: 'pending' as const,
        notes: item.notes ?? undefined,
      })),
      createdAt: order.createdAt,
      targetTime: order.estimatedReadyTime || order.createdAt,
      status: toKdsOrderStatus(order.status),
    }));
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed'): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
