import { prisma, type DisputeStatus } from '@vayva/db';
import { logger } from '../../lib/logger';
import { PaystackService } from './paystack.service';

/**
 * Dispute & Refund Service
 * Handles customer disputes, chargebacks, and refund processing via Paystack
 */
export class DisputeRefundService {
  constructor(
    private readonly db = prisma,
    private readonly paystackService = new PaystackService(),
  ) {}

  /**
   * Initiate a refund for a transaction
   * Processes refund through Paystack
   */
  async initiateRefund(
    storeId: string,
    data: {
      transactionReference: string;
      amountKobo?: number; // Full refund if not specified
      reason: string;
      customerNote?: string;
    }
  ): Promise<{
    success: boolean;
    refundId: string;
    status: string;
    message: string;
  }> {
    try {
      // Step 1: Verify transaction exists and belongs to store
      const transaction = await this.db.transaction.findUnique({
        where: { reference: data.transactionReference },
        include: { store: true },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.storeId !== storeId) {
        throw new Error('Transaction does not belong to this store');
      }

      if (transaction.status !== 'SUCCESS') {
        throw new Error('Can only refund successful transactions');
      }

      // Step 2: Determine refund amount (full or partial)
      const refundAmount = data.amountKobo || Number(transaction.amountKobo);
      
      if (refundAmount > Number(transaction.amountKobo)) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      // Step 3: Process refund via Paystack
      const paystackRefund = await this.paystackService.createRefund({
        transaction: data.transactionReference,
        amount: refundAmount,
        customer_note: data.customerNote || data.reason,
        merchant_note: data.reason,
      });

      // Step 4: Create refund record in database
      const refund = await this.db.refund.create({
        data: {
          transactionId: transaction.id,
          storeId,
          amountKobo: refundAmount,
          status: 'PROCESSING',
          reason: data.reason,
          customerNote: data.customerNote || '',
          merchantNote: data.reason,
          reference: `REF_${Date.now()}`,
          paystackRefundId: paystackRefund.id,
        },
      });

      // Step 5: Update transaction status if full refund
      if (refundAmount >= Number(transaction.amountKobo)) {
        await this.db.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'REFUNDED',
          },
        });
      }

      // Step 6: Create ledger entry for refund
      await this.db.ledgerEntry.create({
        data: {
          storeId,
          amountKobo: -refundAmount,
          type: 'REFUND',
          status: 'PROCESSING',
          description: `Refund for transaction ${data.transactionReference}`,
          reference: refund.reference,
          metadata: {
            refundId: refund.id,
            transactionReference: data.transactionReference,
            reason: data.reason,
          },
        },
      });

      logger.info(`[DisputeRefund] Initiated refund for store ${storeId}`, {
        refundId: refund.id,
        amount: refundAmount,
        transaction: data.transactionReference,
      });

      return {
        success: true,
        refundId: refund.id,
        status: 'PROCESSING',
        message: 'Refund initiated successfully',
      };
    } catch (error: any) {
      logger.error('[DisputeRefund.initiateRefund]', {
        storeId,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Create a dispute for a transaction
   * Initiates dispute resolution process
   */
  async createDispute(
    customerId: string,
    data: {
      transactionReference: string;
      reason: string;
      description: string;
      evidence?: Array<{
        type: string;
        url: string;
        description?: string;
      }>;
    }
  ): Promise<{
    success: boolean;
    disputeId: string;
    message: string;
  }> {
    try {
      // Step 1: Verify transaction
      const transaction = await this.db.transaction.findUnique({
        where: { reference: data.transactionReference },
        include: { store: true },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Step 2: Check if dispute already exists
      const existingDispute = await this.db.dispute.findFirst({
        where: { transactionId: transaction.id },
      });

      if (existingDispute) {
        throw new Error('Dispute already exists for this transaction');
      }

      // Step 3: Create dispute record
      const dispute = await this.db.dispute.create({
        data: {
          transactionId: transaction.id,
          customerId,
          storeId: transaction.storeId,
          reason: data.reason,
          description: data.description,
          status: 'PENDING_REVIEW',
          evidence: data.evidence || [],
        },
      });

      // Step 4: Update transaction status
      await this.db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'DISPUTED',
        },
      });

      // Step 5: Notify store owner (future: send email/SMS)
      logger.info(`[DisputeRefund] Created dispute ${dispute.id}`, {
        transaction: data.transactionReference,
        reason: data.reason,
      });

      return {
        success: true,
        disputeId: dispute.id,
        message: 'Dispute created successfully',
      };
    } catch (error: any) {
      logger.error('[DisputeRefund.createDispute]', {
        customerId,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Add evidence to a dispute
   */
  async addDisputeEvidence(
    disputeId: string,
    data: {
      evidenceType: 'document' | 'image' | 'message';
      url: string;
      description?: string;
      submittedBy: 'customer' | 'merchant' | 'admin';
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const dispute = await this.db.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (['RESOLVED', 'DECLINED'].includes(dispute.status)) {
      throw new Error('Cannot add evidence to closed dispute');
    }

    // Add evidence to dispute
    const updatedEvidence = [
      ...(dispute.evidence as any[] || []),
      {
        type: data.evidenceType,
        url: data.url,
        description: data.description,
        submittedBy: data.submittedBy,
        submittedAt: new Date().toISOString(),
      },
    ];

    await this.db.dispute.update({
      where: { id: disputeId },
      data: {
        evidence: updatedEvidence,
      },
    });

    return {
      success: true,
      message: 'Evidence added successfully',
    };
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(
    disputeId: string,
    data: {
      resolution: 'customer_won' | 'merchant_won' | 'compromise';
      notes: string;
      refundAmountKobo?: number;
      resolvedBy: string; // admin user ID
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const dispute = await this.db.dispute.findUnique({
      where: { id: disputeId },
      include: {
        transaction: true,
      },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === 'RESOLVED') {
      throw new Error('Dispute already resolved');
    }

    // Update dispute status
    await this.db.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolution: data.resolution,
        resolutionNotes: data.notes,
        resolvedAt: new Date(),
        resolvedBy: data.resolvedBy,
      },
    });

    // If customer won, process refund
    if (data.resolution === 'customer_won' && data.refundAmountKobo) {
      try {
        await this.initiateRefund(dispute.storeId, {
          transactionReference: dispute.transaction.reference,
          amountKobo: data.refundAmountKobo,
          reason: `Dispute resolved: ${data.notes}`,
          customerNote: 'Refund issued due to dispute resolution',
        });
      } catch (error: any) {
        logger.error('[DisputeRefund.resolveDispute] Refund failed', {
          disputeId,
          error: error.message,
        });
        // Don't throw - dispute is still resolved even if refund fails
      }
    }

    // Update transaction status
    await this.db.transaction.update({
      where: { id: dispute.transactionId },
      data: {
        status: data.resolution === 'customer_won' ? 'REFUNDED' : 'SUCCESS',
      },
    });

    logger.info(`[DisputeRefund] Resolved dispute ${disputeId}`, {
      resolution: data.resolution,
      refundAmount: data.refundAmountKobo,
    });

    return {
      success: true,
      message: 'Dispute resolved successfully',
    };
  }

  /**
   * Get disputes for a store
   */
  async getStoreDisputes(storeId: string, status?: DisputeStatus) {
    const disputes = await this.db.dispute.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          select: {
            reference: true,
            amountKobo: true,
          },
        },
        customer: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return disputes.map((d) => ({
      id: d.id,
      status: d.status,
      reason: d.reason,
      description: d.description,
      amountKobo: Number(d.transaction.amountKobo),
      transactionReference: d.transaction.reference,
      customerEmail: d.customer.email,
      createdAt: d.createdAt.toISOString(),
      resolvedAt: d.resolvedAt?.toISOString(),
    }));
  }

  /**
   * Get refunds for a store
   */
  async getStoreRefunds(storeId: string, limit = 20) {
    const refunds = await this.db.refund.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        transaction: {
          select: {
            reference: true,
            amountKobo: true,
          },
        },
      },
    });

    return refunds.map((r) => ({
      id: r.id,
      amountKobo: Number(r.amountKobo),
      status: r.status,
      reason: r.reason,
      transactionReference: r.transaction.reference,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
