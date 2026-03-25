import { prismaDelegates } from "@vayva/db";
import { getRetailWebSocketServer } from '../websockets/retail-dashboard';

type MiddlewareParams = {
  model?: string;
  action?: string;
  args?: { where?: { id?: string } };
};
type MiddlewareNext = (params: unknown) => Promise<unknown>;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

/**
 * Prisma middleware to trigger real-time WebSocket broadcasts
 * when database changes occur
 */

export function setupRetailRealtimeHooks() {
  console.warn('[Retail Realtime] Setting up Prisma middleware hooks');

  // Order lifecycle hooks
  prismaDelegates.$use(async (params: unknown, next: MiddlewareNext) => {
    const p = params as MiddlewareParams;
    const result = asRecord(await next(params));

    if (p.model === 'Order') {
      const wss = getRetailWebSocketServer();
      const storeId = String(result.storeId ?? "");
      
      if (p.action === 'create') {
        // New order created
        wss?.broadcastToChannel(`store:${storeId}:orders`, {
          type: 'order_created',
          order: result,
        });

        // Also broadcast to general orders channel
        wss?.broadcastToStore(storeId, 'orders', {
          type: 'new_order',
          orderId: String(result.id ?? ""),
          amount: result.totalAmount,
        });
      }

      if (p.action === 'update') {
        // Order status changed
        wss?.broadcastToChannel(`store:${storeId}:orders`, {
          type: 'order_updated',
          order: result,
        });
      }
    }

    return result;
  });

  // Inventory item hooks
  prismaDelegates.$use(async (params: unknown, next: MiddlewareNext) => {
    const p = params as MiddlewareParams;
    const _before = Date.now();
    const existingId = p.args?.where?.id;
    const oldItem =
      p.model === "InventoryItem" && p.action === "update" && existingId
        ? await prismaDelegates.inventoryItem.findUnique({ where: { id: existingId } })
        : null;

    const result = asRecord(await next(params));
    const _after = Date.now();

    if (p.model === 'InventoryItem') {
      const wss = getRetailWebSocketServer();
      const storeId = String(result.storeId ?? "");
      
      if (p.action === 'update') {
        // Stock level changed
        const quantity = typeof result.quantity === "number" ? result.quantity : 0;
        const reorderPoint = typeof result.reorderPoint === "number" ? result.reorderPoint : 0;
        const product = result.product as Record<string, unknown> | undefined;
        if (oldItem && oldItem.quantity !== quantity) {
          wss?.broadcastToChannel(`store:${storeId}:inventory`, {
            type: 'inventory_updated',
            productId: result.productId,
            previousStock: oldItem.quantity,
            currentStock: quantity,
            change: quantity - oldItem.quantity,
            isLowStock: quantity <= reorderPoint,
          });

          // Alert if low stock
          if (quantity <= reorderPoint && 
              oldItem.quantity > oldItem.reorderPoint) {
            wss?.broadcastToStore(storeId, 'alerts', {
              type: 'low_stock_alert',
              productId: result.productId,
              productName: typeof product?.name === "string" ? product.name : undefined,
              currentStock: quantity,
              reorderPoint,
            });
          }
        }
      }
    }

    return result;
  });

  // Store transfer hooks
  prismaDelegates.$use(async (params: unknown, next: MiddlewareNext) => {
    const p = params as MiddlewareParams;
    const result = asRecord(await next(params));

    if (p.model === 'StoreTransfer') {
      const wss = getRetailWebSocketServer();
      
      if (p.action === 'create' || p.action === 'update') {
        // Broadcast to both stores involved in transfer
        wss?.broadcastToChannel(`store:${String(result.fromStoreId ?? "")}:transfers`, {
          type: 'transfer_updated',
          transfer: result,
        });

        if (result.toStoreId) {
          wss?.broadcastToChannel(`store:${String(result.toStoreId)}:transfers`, {
            type: 'transfer_updated',
            transfer: result,
          });
        }
      }

      if (p.action === 'update' && result.status === 'completed') {
        // Transfer completed - update inventory notifications
        wss?.broadcastToStore(String(result.fromStoreId ?? ""), 'notifications', {
          type: 'transfer_completed',
          transferId: result.id,
          direction: 'outbound',
        });

        if (result.toStoreId) {
          wss?.broadcastToStore(String(result.toStoreId), 'notifications', {
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
  prismaDelegates.$use(async (params: unknown, next: MiddlewareNext) => {
    const p = params as MiddlewareParams;
    const existingId = p.args?.where?.id;
    const oldMember =
      p.model === "LoyaltyMember" && p.action === "update" && existingId
        ? await prismaDelegates.loyaltyMember.findUnique({ where: { id: existingId } })
        : null;

    const result = asRecord(await next(params));

    if (p.model === 'LoyaltyMember') {
      const wss = getRetailWebSocketServer();
      const storeId = String(result.storeId ?? "");
      
      if (p.action === 'update') {
        // Points changed or tier updated
        const points = typeof result.points === "number" ? result.points : 0;
        if (oldMember && oldMember.points !== points) {
          wss?.broadcastToChannel(`store:${storeId}:loyalty`, {
            type: 'loyalty_updated',
            memberId: result.id,
            pointsChange: points - oldMember.points,
            newPoints: points,
            tier: result.tier,
          });
        }
      }
    }

    return result;
  });

  console.warn('[Retail Realtime] Prisma middleware hooks active');
}

/**
 * Manual broadcast helpers for use in services/APIs
 */

export class RetailBroadcast {
  /**
   * Broadcast custom event to store channel
   */
  static async toStore(storeId: string, type: string, data: unknown) {
    const wss = getRetailWebSocketServer();
    wss?.broadcastToStore(storeId, type, data);
  }

  /**
   * Broadcast to specific channel
   */
  static async toChannel(channel: string, data: unknown) {
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
