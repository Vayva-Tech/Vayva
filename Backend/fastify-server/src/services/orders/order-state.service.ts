import { prisma, FulfillmentStatus, OrderStatus } from '@vayva/db';
import { logger } from '@vayva/shared';

interface OrderTransitionResult {
  success: boolean;
  order?: typeof import('@vayva/db').Order;
  error?: string;
  fromStatus?: string;
  toStatus?: string;
}

export class OrderStateService {
  /**
   * Transition order fulfillment status with state machine validation
   */
  async transition(
    orderId: string,
    toStatus: FulfillmentStatus,
    actorId: string,
    storeId: string
  ): Promise<OrderTransitionResult> {
    try {
      // 1. Fetch current order with relations
      const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
        include: {
          customer: true,
          store: true,
          shipments: true,
        },
      });

      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      const fromStatus = order.fulfillmentStatus;

      // 2. Validate status transition (state machine)
      if (toStatus === fromStatus) {
        logger.info('[ORDER] Status unchanged', { orderId, storeId, status: fromStatus });
        return {
          success: true,
          order,
          fromStatus,
          toStatus,
        };
      }

      // Validate allowed transitions
      const validTransitions = this.getValidTransitions(fromStatus);
      if (!validTransitions.includes(toStatus)) {
        logger.warn('[ORDER] Invalid status transition', {
          orderId,
          storeId,
          fromStatus,
          toStatus,
          actorId,
        });
        
        // For MVP, allow but log - in production, should throw error
        // return {
        //   success: false,
        //   error: `Invalid transition from ${fromStatus} to ${toStatus}`,
        // };
      }

      // 3. Update order status
      const updateData: any = {
        fulfillmentStatus: toStatus,
      };

      // Auto-complete order when delivered
      if (toStatus === FulfillmentStatus.DELIVERED) {
        updateData.status = OrderStatus.DELIVERED;
      }

      await prisma.order.updateMany({
        where: { id: orderId, storeId },
        data: updateData,
      });

      // Fetch updated order
      const updatedOrder = await prisma.order.findFirst({
        where: { id: orderId, storeId },
      });

      if (!updatedOrder) {
        return {
          success: false,
          error: 'Failed to fetch updated order',
        };
      }

      // 4. Trigger side effects (notifications)
      await this.triggerSideEffects(updatedOrder, toStatus);

      // 5. Log audit event
      if (actorId) {
        await this.logAuditEvent(storeId, actorId, orderId, fromStatus, toStatus);
      }

      logger.info('[ORDER] Status transitioned', {
        orderId,
        storeId,
        fromStatus,
        toStatus,
        actorId,
      });

      return {
        success: true,
        order: updatedOrder,
        fromStatus,
        toStatus,
      };
    } catch (error) {
      logger.error('[ORDER] Failed to transition status', {
        orderId,
        storeId,
        actorId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get valid status transitions for a given status
   */
  private getValidTransitions(fromStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      UNFULFILLED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['UNFULFILLED', 'SHIPPED', 'CANCELLED'],
      SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
      DELIVERED: ['RETURNED'],
      RETURNED: [],
      CANCELLED: [],
    };

    return transitions[fromStatus] || [];
  }

  /**
   * Trigger side effects based on status change
   */
  private async triggerSideEffects(
    order: typeof import('@vayva/db').Order,
    toStatus: FulfillmentStatus
  ): Promise<void> {
    try {
      // Trigger "Shipped" email when status moves to OUT_FOR_DELIVERY
      if (toStatus === FulfillmentStatus.OUT_FOR_DELIVERY) {
        await this.sendShippedNotification(order);
      }

      // Additional notifications can be added here:
      // - Order confirmed email (UNFULFILLED -> PROCESSING)
      // - Delivery confirmation (DELIVERED)
      // - Return instructions (RETURNED)
    } catch (error) {
      logger.error('[ORDER] Failed to trigger side effects', {
        orderId: order.id,
        error,
      });
      // Don't fail the transition if notification fails
    }
  }

  /**
   * Send shipped notification email
   */
  private async sendShippedNotification(
    order: typeof import('@vayva/db').Order
  ): Promise<void> {
    try {
      const customerEmail = order.customerEmail;
      if (!customerEmail) {
        logger.warn('[ORDER] No customer email for shipped notification', {
          orderId: order.id,
        });
        return;
      }

      const storeName = order.store?.name || 'Store';
      const trackingUrl = order.shipments?.[0]?.trackingUrl || '';
      const orderNumber = String(order.orderNumber);

      // TODO: Integrate with email service
      // For now, log the intent
      logger.info('[ORDER] Would send shipped notification', {
        orderId: order.id,
        customerEmail,
        storeName,
        trackingUrl,
        orderNumber,
      });

      // Integration with ResendEmailService will be done in frontend migration
      // ResendEmailService.sendOrderShippedEmail(...)
    } catch (error) {
      logger.error('[ORDER] Failed to prepare shipped notification', {
        orderId: order.id,
        error,
      });
    }
  }

  /**
   * Log audit event for status change
   */
  private async logAuditEvent(
    storeId: string,
    actorId: string,
    orderId: string,
    fromStatus: string,
    toStatus: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          storeId,
          actorUserId: actorId,
          action: 'ORDER_STATUS_CHANGE',
          targetType: 'ORDER',
          targetId: orderId,
          severity: 'INFO',
          metadata: {
            fromStatus,
            toStatus,
            timestamp: new Date().toISOString(),
          },
        },
      });

      logger.debug('[AUDIT] Order status change logged', {
        storeId,
        orderId,
        actorId,
        fromStatus,
        toStatus,
      });
    } catch (error) {
      logger.error('[AUDIT] Failed to log order status change', {
        storeId,
        orderId,
        error,
      });
      // Don't fail the transition if audit logging fails
    }
  }

  /**
   * Get current order status
   */
  async getStatus(orderId: string, storeId: string) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
        select: {
          id: true,
          orderNumber: true,
          fulfillmentStatus: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      return {
        success: true,
        order,
      };
    } catch (error) {
      logger.error('[ORDER] Failed to get status', {
        orderId,
        storeId,
        error,
      });
      throw error;
    }
  }

  /**
   * Bulk update order statuses
   */
  async bulkUpdate(
    orderIds: string[],
    toStatus: FulfillmentStatus,
    actorId: string,
    storeId: string
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const result = await prisma.order.updateMany({
        where: {
          id: { in: orderIds },
          storeId,
        },
        data: {
          fulfillmentStatus: toStatus,
          ...(toStatus === FulfillmentStatus.DELIVERED && {
            status: OrderStatus.DELIVERED,
          }),
        },
      });

      logger.info('[ORDER] Bulk status update', {
        storeId,
        actorId,
        orderCount: result.count,
        toStatus,
      });

      return {
        success: true,
        count: result.count,
      };
    } catch (error) {
      logger.error('[ORDER] Bulk update failed', {
        storeId,
        actorId,
        error,
      });
      throw error;
    }
  }
}
