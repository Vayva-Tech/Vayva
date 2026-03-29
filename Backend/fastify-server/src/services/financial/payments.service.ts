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
   * Get payment transactions for ops dashboard
   */
  async getOpsPayments(storeId: string, status: string, limit = 100) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const whereClause: any = {
      createdAt: { gte: twentyFourHoursAgo },
    };

    if (status !== 'all') {
      whereClause.paymentStatus = status;
    }

    const orders = await this.db.order.findMany({
      where: whereClause,
      include: {
        store: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber || order.id.slice(0, 8),
      amount: Number(order.total || 0),
      status: order.paymentStatus || 'PENDING',
      provider: 'Paystack',
      reference: order.refCode || order.id,
      storeName: order.store?.name || 'Unknown',
      storeId: order.storeId,
      customerEmail: order.customerEmail || '',
      createdAt: order.createdAt.toISOString(),
    }));
  }

  /**
   * Get payment stats for last 24 hours
   */
  async getPaymentStats() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [success, pending, failed] = await Promise.all([
      this.db.order.count({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      this.db.order.count({
        where: {
          paymentStatus: 'PENDING',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      this.db.order.count({
        where: {
          paymentStatus: 'FAILED',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
    ]);

    return { success, pending, failed, total: success + pending + failed };
  }

  /**
   * Get wallet funding transactions for ops dashboard
   */
  async getWalletFunding(params: {
    page: number;
    limit: number;
    q?: string;
    storeId?: string;
  }) {
    const { page, limit, q, storeId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        { type: 'WALLET_FUNDING' },
        { provider: 'paystack' },
        storeId ? { storeId } : {},
        q
          ? {
              OR: [
                { reference: { contains: q, mode: 'insensitive' } },
                { store: { name: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.db.paymentTransaction.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { store: { select: { name: true, slug: true } } },
      }),
      this.db.paymentTransaction.count({ where }),
    ]);

    const data = items.map((t: any) => ({
      id: t.id,
      storeId: t.storeId,
      storeName: t.store?.name || 'Unknown',
      storeSlug: t.store?.slug,
      reference: t.reference,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt,
      metadata: t.metadata,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payouts/withdrawals for ops dashboard
   */
  async getPayouts(status: string) {
    const where: any = {};
    if (status !== 'ALL') where.status = status;

    const withdrawals = await this.db.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            bankBeneficiaries: {
              where: { isDefault: true },
              take: 1,
            },
            walletPin: true,
          },
        },
      },
      take: 100,
    });

    return withdrawals.map((w) => {
      const bank = w.store.bankBeneficiaries[0];
      return {
        ...w,
        amountKobo: w.amountKobo?.toString() ?? '0',
        feeKobo: w.feeKobo?.toString() ?? '0',
        amountNetKobo: w.amountNetKobo?.toString() ?? '0',
        feePercent: w.feePercent?.toString() ?? '0',
        bankDetails: bank
          ? {
              bankName: bank.bankName,
              accountNumber: bank.accountNumber,
              accountName: bank.accountName,
            }
          : null,
        hasWalletPin: !!w.store.walletPin,
      };
    });
  }

  /**
   * Get webhook events for ops dashboard
   */
  async getWebhookEvents(params: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    storeId?: string;
  }) {
    const { page, limit, q, status, storeId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        { provider: 'paystack' },
        storeId ? { storeId } : {},
        status ? { status } : {},
        q
          ? {
              OR: [
                { providerEventId: { contains: q, mode: 'insensitive' } },
                { eventType: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.db.paymentWebhookEvent?.findMany({
        where,
        take: limit,
        skip,
        orderBy: { receivedAt: 'desc' },
      }),
      this.db.paymentWebhookEvent?.count({ where }),
    ]);

    const data = items.map((e: any) => ({
      id: e.id,
      storeId: e.storeId,
      provider: e.provider,
      providerEventId: e.providerEventId,
      eventType: e.eventType,
      status: e.status,
      error: e.error,
      receivedAt: e.receivedAt,
      processedAt: e.processedAt,
      payload: e.payload,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Reprocess a webhook event
   */
  async reprocessWebhook(eventId: string, userId: string, userEmail: string, reason: string) {
    const webhookEvent = await this.db.paymentWebhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!webhookEvent) {
      throw new Error('Webhook event not found');
    }

    if (webhookEvent.status === 'PROCESSED') {
      throw new Error('Event already processed');
    }

    // Update status to RECEIVED for reprocessing
    await this.db.paymentWebhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'RECEIVED',
        error: null,
      },
    });

    logger.info('[PAYSTACK_WEBHOOK_REPROCESS]', {
      eventId,
      providerEventId: webhookEvent.providerEventId,
      eventType: webhookEvent.eventType,
      storeId: webhookEvent.storeId,
      operatorId: userId,
      operatorEmail: userEmail,
      reason,
      previousStatus: webhookEvent.status,
    });

    return {
      success: true,
      message: 'Webhook event queued for reprocessing',
      event: {
        id: webhookEvent.id,
        provider: webhookEvent.provider,
        providerEventId: webhookEvent.providerEventId,
        eventType: webhookEvent.eventType,
        status: 'QUEUED',
        storeId: webhookEvent.storeId,
        receivedAt: webhookEvent.receivedAt,
      },
    };
  }

  /**
   * Manually reconcile wallet funding
   */
  async reconcileWalletFunding(
    storeId: string,
    userId: string,
    userEmail: string,
    reason: string,
    amountKobo: number
  ) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      include: { wallet: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    if (!store.wallet) {
      throw new Error('Store has no wallet');
    }

    if (store.wallet.isLocked) {
      throw new Error('Wallet is locked - cannot reconcile');
    }

    // Perform reconciliation as transaction
    const result = await this.db.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: store.wallet!.id },
        data: {
          availableKobo: { increment: BigInt(amountKobo) },
        },
      });

      // Create ledger entry
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          storeId,
          referenceType: 'MANUAL_RECONCILE',
          referenceId: `manual-${Date.now()}`,
          direction: 'CREDIT',
          account: 'WALLET',
          amount: amountKobo / 100,
          currency: 'NGN',
          description: `Manual reconciliation: ${reason}`,
          metadata: {
            operatorId: userId,
            operatorEmail: userEmail,
            previousBalanceKobo: store.wallet!.availableKobo.toString(),
            newBalanceKobo: updatedWallet.availableKobo.toString(),
          },
        },
      });

      return { updatedWallet, ledgerEntry };
    });

    logger.info('[WALLET_MANUAL_RECONCILE]', {
      storeId,
      storeName: store.name,
      walletId: store.wallet.id,
      amountKobo,
      operatorId: userId,
      operatorEmail: userEmail,
      reason,
      previousBalanceKobo: store.wallet.availableKobo.toString(),
      newBalanceKobo: result.updatedWallet.availableKobo.toString(),
      ledgerEntryId: result.ledgerEntry.id,
    });

    return {
      success: true,
      message: 'Wallet reconciled successfully',
      data: {
        storeId,
        storeName: store.name,
        walletId: store.wallet.id,
        amountKobo,
        previousBalanceKobo: store.wallet.availableKobo.toString(),
        newBalanceKobo: result.updatedWallet.availableKobo.toString(),
        ledgerEntryId: result.ledgerEntry.id,
      },
    };
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
