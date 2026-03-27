import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class RefundService {
  constructor(private readonly db = prisma) {}

  async getRefunds(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const where: any = { storeId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    const [refunds, total] = await Promise.all([
      this.db.refund.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerId: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.refund.count({ where }),
    ]);

    return {
      refunds: refunds.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.order.orderNumber,
        customerId: r.order.customerId,
        customer: r.order.customer,
        amount: r.amount,
        currency: r.currency,
        reason: r.reason,
        status: r.status,
        providerRefundId: r.providerRefundId,
        processedAt: r.processedAt,
        failureCode: r.failureCode,
        failureMessage: r.failureMessage,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async createRefund(storeId: string, refundData: any) {
    const { orderId, amount, reason, paymentTransactionId } = refundData;

    // Verify order exists and belongs to store
    const order = await this.db.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        paymentTransactions: {
          select: { id: true, reference: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order is paid
    const validPaymentStatuses = ['CAPTURED', 'PARTIALLY_REFUNDED'];
    if (!validPaymentStatuses.includes(order.paymentStatus as any)) {
      throw new Error('Cannot refund unpaid order');
    }

    // Check if refund amount is valid
    const totalPaid = order.total;
    const existingRefunds = await this.db.refund.aggregate({
      where: { orderId, status: { in: ['APPROVED', 'SUCCESS'] } },
      _sum: { amount: true },
    });
    const totalRefunded = existingRefunds._sum.amount || 0;
    const maxRefundable = Number(totalPaid) - Number(totalRefunded);

    if (amount > maxRefundable) {
      throw new Error('Refund amount exceeds refundable amount');
    }

    // Get payment transaction for refund
    const paymentTx = paymentTransactionId
      ? order.paymentTransactions.find((p) => p.id === paymentTransactionId)
      : order.paymentTransactions[0];

    if (!paymentTx && !paymentTransactionId) {
      throw new Error('No payment transaction found for refund');
    }

    // Create refund record
    const refund = await this.db.refund.create({
      data: {
        storeId,
        orderId,
        paymentTransactionId: paymentTx?.id || paymentTransactionId,
        amount,
        reason,
        status: 'REQUESTED',
      },
    });

    logger.info(`[Refund] Created refund ${refund.id}`);
    return refund;
  }

  async processRefundAction(
    storeId: string,
    refundId: string,
    action: string,
    notes?: string
  ) {
    const refund = await this.db.refund.findFirst({
      where: { id: refundId, storeId },
    });

    if (!refund) {
      throw new Error('Refund not found');
    }

    if (refund.status === 'SUCCESS') {
      throw new Error('Refund already processed');
    }

    if (action === 'reject') {
      const updated = await this.db.refund.update({
        where: { id: refundId },
        data: {
          status: 'FAILED',
          reason: notes ? `${refund.reason} | Rejection: ${notes}` : refund.reason,
        },
      });
      logger.info(`[Refund] Rejected refund ${refundId}`);
      return updated;
    }

    if (action === 'approve') {
      const updated = await this.db.refund.update({
        where: { id: refundId },
        data: { status: 'APPROVED' },
      });
      logger.info(`[Refund] Approved refund ${refundId}`);
      return updated;
    }

    throw new Error('Invalid action');
  }
}
