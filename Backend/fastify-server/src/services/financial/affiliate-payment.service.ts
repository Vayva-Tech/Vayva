import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { PaystackService } from './paystack.service';

/**
 * Affiliate Payment Service
 * Handles commission payouts to affiliates via Paystack transfers
 */
export class AffiliatePaymentService {
  constructor(
    private readonly db = prisma,
    private readonly paystackService = new PaystackService(),
  ) {}

  /**
   * Process affiliate commission payout
   * Creates transfer recipient and initiates Paystack transfer
   */
  async processCommissionPayout(
    affiliateId: string,
    data: {
      amountKobo: number;
      bankAccount: {
        accountNumber: string;
        bankCode: string;
        accountName: string;
      };
      reason: string;
    }
  ): Promise<{
    success: boolean;
    transferCode: string;
    reference: string;
    message: string;
  }> {
    try {
      // Step 1: Validate affiliate has sufficient commission balance
      const affiliate = await this.db.affiliate.findUnique({
        where: { id: affiliateId },
        include: {
          commissions: {
            where: { status: 'PENDING' },
          },
        },
      });

      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      const pendingCommissions = affiliate.commissions.reduce(
        (sum, comm) => sum + Number(comm.amountKobo),
        0
      );

      if (pendingCommissions < data.amountKobo) {
        throw new Error('Insufficient commission balance');
      }

      // Step 2: Create Paystack transfer recipient
      const recipient = await this.paystackService.createTransferRecipient({
        type: 'nuban',
        name: data.bankAccount.accountName,
        accountNumber: data.bankAccount.accountNumber,
        bankCode: data.bankAccount.bankCode,
        currency: 'NGN',
      });

      // Step 3: Initiate transfer via Paystack
      const reference = `AFF_${Date.now()}_${affiliateId.slice(-6)}`;
      const transfer = await this.paystackService.initiateTransfer({
        amountKobo: data.amountKobo,
        recipientCode: recipient.recipientCode,
        reference,
        reason: data.reason || 'Affiliate commission payout',
      });

      // Step 4: Create affiliate payout record
      const payout = await this.db.affiliatePayout.create({
        data: {
          affiliateId,
          amountKobo: data.amountKobo,
          status: 'PROCESSING',
          reference,
          transferCode: transfer.transferCode,
          bankAccount: data.bankAccount.accountNumber,
          processedAt: new Date(),
        },
      });

      // Step 5: Mark commissions as paid
      await this.db.commission.updateMany({
        where: {
          affiliateId,
          status: 'PENDING',
        },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      logger.info(`[AffiliatePayment] Processed payout for affiliate ${affiliateId}`, {
        transferCode: transfer.transferCode,
        amount: data.amountKobo,
        reference,
      });

      return {
        success: true,
        transferCode: transfer.transferCode,
        reference,
        message: 'Affiliate commission payout processed successfully',
      };
    } catch (error: any) {
      logger.error('[AffiliatePayment.processCommissionPayout]', {
        affiliateId,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Get pending affiliate commissions
   */
  async getPendingCommissions(affiliateId: string) {
    const commissions = await this.db.commission.findMany({
      where: {
        affiliateId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalKobo = commissions.reduce(
      (sum, comm) => sum + Number(comm.amountKobo),
      0
    );

    return {
      commissions,
      totalKobo,
      count: commissions.length,
    };
  }

  /**
   * Get affiliate payout history
   */
  async getPayoutHistory(affiliateId: string, limit = 20) {
    const payouts = await this.db.affiliatePayout.findMany({
      where: { affiliateId },
      orderBy: { processedAt: 'desc' },
      take: limit,
    });

    return payouts.map((payout) => ({
      id: payout.id,
      amountKobo: Number(payout.amountKobo),
      status: payout.status,
      reference: payout.reference,
      bankAccount: payout.bankAccount,
      processedAt: payout.processedAt?.toISOString(),
    }));
  }
}
