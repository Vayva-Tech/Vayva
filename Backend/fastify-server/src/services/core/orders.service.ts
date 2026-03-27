import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Orders Service - Backend
 * Manages order creation, processing, and fulfillment
 */
export class OrdersService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a new order
   */
  async createOrder(orderData: any) {
    const {
      storeId,
      customerId,
      items,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    } = orderData;

    try {
      const order = await this.db.order.create({
        data: {
          id: `order-${Date.now()}`,
          storeId,
          customerId,
          status: 'PENDING_PAYMENT',
          paymentStatus: 'INITIATED',
          fulfillmentStatus: 'UNFULFILLED',
          totalAmount,
          subtotal: orderData.subtotal || totalAmount,
          taxAmount: orderData.taxAmount || 0,
          shippingCost: orderData.shippingCost || 0,
          discountAmount: orderData.discountAmount || 0,
          shippingAddress,
          billingAddress,
          paymentMethod: paymentMethod || 'paystack',
          notes: notes || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      logger.info(`[Orders] Created order ${order.id} for store ${storeId}`);
      return order;
    } catch (error) {
      logger.error('[Orders] Create failed:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get orders for a store with filtering
   */
  async getStoreOrders(
    storeId: string,
    filters: {
      status?: string;
      paymentStatus?: string;
      fulfillmentStatus?: string;
      limit?: number;
      offset?: number;
      search?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    const where: any = { storeId };

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'ALL') {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.fulfillmentStatus && filters.fulfillmentStatus !== 'ALL') {
      where.fulfillmentStatus = filters.fulfillmentStatus;
    }

    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search } },
        { customerEmail: { contains: filters.search } },
        { shippingAddress: { path: ['city'], equals: filters.search } },
      ];
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.order.count({ where }),
    ]);

    return { orders, total, limit, offset };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, storeId: string) {
    const order = await this.db.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: true,
        customer: true,
        paymentTransactions: true,
      },
    });

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    storeId: string,
    status: string,
    metadata?: any
  ) {
    const order = await this.getOrderById(orderId, storeId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const updates: any = { status };

    // Track status changes
    if (status === 'CONFIRMED') {
      updates.confirmedAt = new Date();
    } else if (status === 'PROCESSING') {
      updates.processingAt = new Date();
    } else if (status === 'READY') {
      updates.readyAt = new Date();
    } else if (status === 'FULFILLED') {
      updates.fulfilledAt = new Date();
    } else if (status === 'CANCELLED') {
      updates.cancelledAt = new Date();
      updates.cancellationReason = metadata?.reason || null;
    }

    const updated = await this.db.order.update({
      where: { id: orderId },
      data: updates,
    });

    logger.info(`[Orders] Order ${orderId} status updated to ${status}`);
    return updated;
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string,
    storeId: string,
    paymentStatus: string,
    transactionData?: any
  ) {
    const order = await this.getOrderById(orderId, storeId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const updated = await this.db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        lastPaymentAttempt: paymentStatus === 'SUCCESS' ? new Date() : undefined,
      },
    });

    // Record payment transaction if provided
    if (transactionData) {
      await this.db.paymentTransaction.create({
        data: {
          id: `txn-${Date.now()}`,
          orderId,
          storeId,
          amount: transactionData.amount,
          status: paymentStatus,
          provider: transactionData.provider || 'paystack',
          reference: transactionData.reference,
          metadata: transactionData.metadata,
        },
      });
    }

    logger.info(`[Orders] Order ${orderId} payment status: ${paymentStatus}`);
    return updated;
  }

  /**
   * Update fulfillment status
   */
  async updateFulfillmentStatus(
    orderId: string,
    storeId: string,
    fulfillmentStatus: string,
    trackingData?: any
  ) {
    const order = await this.getOrderById(orderId, storeId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const updates: any = { fulfillmentStatus };

    if (trackingData) {
      updates.trackingNumber = trackingData.trackingNumber;
      updates.trackingUrl = trackingData.trackingUrl;
      updates.shippingCarrier = trackingData.carrier;
    }

    const updated = await this.db.order.update({
      where: { id: orderId },
      data: updates,
    });

    logger.info(`[Orders] Order ${orderId} fulfillment: ${fulfillmentStatus}`);
    return updated;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, storeId: string, reason: string) {
    const order = await this.getOrderById(orderId, storeId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (['FULFILLED', 'CANCELLED'].includes(order.status)) {
      throw new Error('Cannot cancel order in current state');
    }

    const updated = await this.db.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    logger.info(`[Orders] Order ${orderId} cancelled: ${reason}`);
    return updated;
  }

  /**
   * Get order statistics
   */
  async getOrderStats(storeId: string, period: { from: Date; to: Date }) {
    const [totalOrders, totalRevenue, pendingOrders, fulfilledOrders] = await Promise.all([
      this.db.order.count({
        where: {
          storeId,
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.order.aggregate({
        where: {
          storeId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: period.from, lte: period.to },
        },
        _sum: { totalAmount: true },
      }),
      this.db.order.count({
        where: {
          storeId,
          status: 'PENDING_PAYMENT',
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.order.count({
        where: {
          storeId,
          status: 'FULFILLED',
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      fulfilledOrders,
      averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.totalAmount || 0) / totalOrders : 0,
    };
  }
}
