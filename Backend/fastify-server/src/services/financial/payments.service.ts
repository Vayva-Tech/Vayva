import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Payments Service - Backend
 * Manages payment processing, transactions, refunds, and webhooks
 */
export class PaymentsService {
  constructor(private readonly db = prisma) {}

  /**
   * Initialize a payment
   */
  async initializePayment(paymentData: any) {
    const {
      storeId,
      orderId,
      amount,
      currency = 'NGN',
      paymentMethod = 'paystack',
      customerEmail,
      metadata,
    } = paymentData;

    try {
      // Create payment transaction record
      const transaction = await this.db.paymentTransaction.create({
        data: {
          id: `txn-${Date.now()}`,
          storeId,
          orderId,
          amount,
          currency,
          status: 'INITIATED',
          provider: paymentMethod,
          customerEmail,
          metadata: metadata || {},
          initiatedAt: new Date(),
        },
      });

      logger.info(`[Payments] Initialized payment ${transaction.id} for order ${orderId}`);
      return transaction;
    } catch (error) {
      logger.error('[Payments] Initialize failed:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  /**
   * Verify a payment
   */
  async verifyPayment(transactionId: string, storeId: string, verificationData?: any) {
    const transaction = await this.db.paymentTransaction.findFirst({
      where: { id: transactionId, storeId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status based on verification
    const updates: any = {
      verifiedAt: new Date(),
      metadata: {
        ...transaction.metadata,
        ...verificationData,
      },
    };

    if (verificationData?.status === 'success') {
      updates.status = 'SUCCESS';
      updates.completedAt = new Date();
    } else if (verificationData?.status === 'failed') {
      updates.status = 'FAILED';
      updates.failureReason = verificationData.reason || 'Payment failed';
    }

    const updated = await this.db.paymentTransaction.update({
      where: { id: transactionId },
      data: updates,
    });

    // Update order payment status if linked to order
    if (transaction.orderId) {
      await this.db.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: updates.status,
          lastPaymentAttempt: new Date(),
        },
      });
    }

    logger.info(`[Payments] Verified payment ${transactionId}: ${updates.status}`);
    return updated;
  }

  /**
   * Process webhook from payment provider
   */
  async processWebhook(webhookData: any) {
    const {
      provider,
      event,
      reference,
      status,
      amount,
      metadata,
    } = webhookData;

    try {
      // Find transaction by reference
      const transaction = await this.db.paymentTransaction.findFirst({
        where: {
          provider,
          OR: [
            { reference },
            { metadata: { path: ['reference'], equals: reference } },
          ],
        },
      });

      if (!transaction) {
        logger.warn(`[Payments] Webhook for unknown transaction: ${reference}`);
        return { success: false, error: 'Transaction not found' };
      }

      // Process based on event type
      switch (event) {
        case 'charge.success':
          await this.handleSuccessfulPayment(transaction.id, {
            status: 'SUCCESS',
            reference,
            amount,
            providerMetadata: metadata,
          });
          break;

        case 'charge.failed':
          await this.handleFailedPayment(transaction.id, {
            status: 'FAILED',
            reason: metadata?.message || 'Payment failed',
          });
          break;

        case 'refund.processed':
          await this.handleRefundProcessed(transaction.id, {
            refundAmount: amount,
            refundReference: reference,
          });
          break;

        default:
          logger.warn(`[Payments] Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      logger.error('[Payments] Webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  private async handleSuccessfulPayment(transactionId: string, data: any) {
    const transaction = await this.db.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) return;

    await this.db.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        reference: data.reference,
        metadata: {
          ...transaction.metadata,
          providerMetadata: data.providerMetadata,
        },
      },
    });

    // Update order if exists
    if (transaction.orderId) {
      await this.db.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: 'SUCCESS',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });
    }

    logger.info(`[Payments] Payment successful: ${transactionId}`);
  }

  /**
   * Handle failed payment
   */
  private async handleFailedPayment(transactionId: string, data: any) {
    const transaction = await this.db.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) return;

    await this.db.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        failureReason: data.reason,
      },
    });

    // Update order if exists
    if (transaction.orderId) {
      await this.db.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });
    }

    logger.info(`[Payments] Payment failed: ${transactionId}`);
  }

  /**
   * Process refund
   */
  async processRefund(
    transactionId: string,
    storeId: string,
    refundData: {
      amount?: number;
      reason?: string;
    }
  ) {
    const transaction = await this.db.paymentTransaction.findFirst({
      where: { id: transactionId, storeId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'SUCCESS') {
      throw new Error('Can only refund successful transactions');
    }

    const refundAmount = refundData.amount || transaction.amount;

    // Create refund record
    const refund = await this.db.refund.create({
      data: {
        id: `ref-${Date.now()}`,
        transactionId,
        storeId,
        orderId: transaction.orderId,
        amount: refundAmount,
        reason: refundData.reason || null,
        status: 'PENDING',
        initiatedAt: new Date(),
      },
    });

    logger.info(`[Payments] Refund initiated: ${refund.id} for ${refundAmount}`);
    return refund;
  }

  /**
   * Get payment transactions
   */
  async getTransactions(
    storeId: string,
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      orderId?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [transactions, total] = await Promise.all([
      this.db.paymentTransaction.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              customerEmail: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.paymentTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string, storeId: string) {
    return await this.db.paymentTransaction.findFirst({
      where: { id: transactionId, storeId },
      include: {
        order: true,
        refunds: true,
      },
    });
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(storeId: string, period: { from: Date; to: Date }) {
    const [totalTransactions, successfulTransactions, failedTransactions, totalVolume] = await Promise.all([
      this.db.paymentTransaction.count({
        where: {
          storeId,
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.paymentTransaction.count({
        where: {
          storeId,
          status: 'SUCCESS',
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.paymentTransaction.count({
        where: {
          storeId,
          status: 'FAILED',
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.paymentTransaction.aggregate({
        where: {
          storeId,
          status: 'SUCCESS',
          createdAt: { gte: period.from, lte: period.to },
        },
        _sum: { amount: true },
      }),
    ]);

    const successRate = totalTransactions > 0 
      ? (successfulTransactions / totalTransactions) * 100 
      : 0;

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      totalVolume: totalVolume._sum.amount || 0,
      successRate: parseFloat(successRate.toFixed(2)),
      averageTransactionValue: totalTransactions > 0 
        ? (totalVolume._sum.amount || 0) / totalTransactions 
        : 0,
    };
  }
}
