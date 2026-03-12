import { prisma } from '@vayva/db';
import { getRetailWebSocketServer } from '../websockets/retail-dashboard';

/**
 * Prisma middleware to trigger real-time WebSocket broadcasts
 * when database changes occur
 */

export function setupRetailRealtimeHooks() {
  console.log('[Retail Realtime] Setting up Prisma middleware hooks');

  // Order lifecycle hooks
  prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === 'Order') {
      const wss = getRetailWebSocketServer();
      
      if (params.action === 'create') {
        // New order created
        wss?.broadcastToChannel(`store:${result.storeId}:orders`, {
          type: 'order_created',
          order: result,
        });

        // Also broadcast to general orders channel
        wss?.broadcastToStore(result.storeId, 'orders', {
          type: 'new_order',
          orderId: result.id,
          amount: result.totalAmount,
        });
      }

      if (params.action === 'update') {
        // Order status changed
        wss?.broadcastToChannel(`store:${result.storeId}:orders`, {
          type: 'order_updated',
          order: result,
        });
      }
    }

    return result;
  });

  // Inventory item hooks
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    if (params.model === 'InventoryItem') {
      const wss = getRetailWebSocketServer();
      
      if (params.action === 'update') {
        // Stock level changed
        const oldItem = await prisma.inventoryItem.findUnique({
          where: { id: result.id },
        });

        if (oldItem && oldItem.quantity !== result.quantity) {
          wss?.broadcastToChannel(`store:${result.storeId}:inventory`, {
            type: 'inventory_updated',
            productId: result.productId,
            previousStock: oldItem.quantity,
            currentStock: result.quantity,
            change: result.quantity - oldItem.quantity,
            isLowStock: result.quantity <= result.reorderPoint,
          });

          // Alert if low stock
          if (result.quantity <= result.reorderPoint && 
              oldItem.quantity > oldItem.reorderPoint) {
            wss?.broadcastToStore(result.storeId, 'alerts', {
              type: 'low_stock_alert',
              productId: result.productId,
              productName: result.product?.name,
              currentStock: result.quantity,
              reorderPoint: result.reorderPoint,
            });
          }
        }
      }
    }

    return result;
  });

  // Store transfer hooks
  prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === 'StoreTransfer') {
      const wss = getRetailWebSocketServer();
      
      if (params.action === 'create' || params.action === 'update') {
        // Broadcast to both stores involved in transfer
        wss?.broadcastToChannel(`store:${result.fromStoreId}:transfers`, {
          type: 'transfer_updated',
          transfer: result,
        });

        if (result.toStoreId) {
          wss?.broadcastToChannel(`store:${result.toStoreId}:transfers`, {
            type: 'transfer_updated',
            transfer: result,
          });
        }
      }

      if (params.action === 'update' && result.status === 'completed') {
        // Transfer completed - update inventory notifications
        wss?.broadcastToStore(result.fromStoreId, 'notifications', {
          type: 'transfer_completed',
          transferId: result.id,
          direction: 'outbound',
        });

        if (result.toStoreId) {
          wss?.broadcastToStore(result.toStoreId, 'notifications', {
            type: 'transfer_completed',
            transferId: result.id,
            direction: 'inbound',
          });
        }
      }
    }

    return result;
  });

  // Customer/Loyalty program hooks
  prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === 'LoyaltyMember') {
      const wss = getRetailWebSocketServer();
      
      if (params.action === 'update') {
        // Points changed or tier updated
        const oldMember = await prisma.loyaltyMember.findUnique({
          where: { id: result.id },
        });

        if (oldMember && oldMember.points !== result.points) {
          wss?.broadcastToChannel(`store:${result.storeId}:loyalty`, {
            type: 'loyalty_updated',
            memberId: result.id,
            pointsChange: result.points - oldMember.points,
            newPoints: result.points,
            tier: result.tier,
          });
        }
      }
    }

    return result;
  });

  console.log('[Retail Realtime] Prisma middleware hooks active');
}

/**
 * Manual broadcast helpers for use in services/APIs
 */

export class RetailBroadcast {
  /**
   * Broadcast custom event to store channel
   */
  static async toStore(storeId: string, type: string, data: any) {
    const wss = getRetailWebSocketServer();
    wss?.broadcastToStore(storeId, type, data);
  }

  /**
   * Broadcast to specific channel
   */
  static async toChannel(channel: string, data: any) {
    const wss = getRetailWebSocketServer();
    wss?.broadcastToChannel(channel, data);
  }

  /**
   * Send targeted notification
   */
  static async notify(storeId: string, notification: {
    type: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) {
    const wss = getRetailWebSocketServer();
    wss?.broadcastToChannel(`store:${storeId}:notifications`, notification);
  }

  /**
   * Alert for critical events
   */
  static async alert(storeId: string, alert: {
    severity: 'info' | 'warning' | 'critical';
    category: string;
    message: string;
    actionRequired?: boolean;
  }) {
    const wss = getRetailWebSocketServer();
    wss?.broadcastToChannel(`store:${storeId}:alerts`, alert);
  }
}
