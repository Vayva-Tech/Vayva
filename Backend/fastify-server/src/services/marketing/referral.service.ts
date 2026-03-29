import { prisma, type ExtendedPrismaClient } from '@vayva/db';
import { nanoid } from 'nanoid';
import { logger } from '../../lib/logger';

interface ReferralStats {
  referralCode: string | undefined;
  stats: {
    totalEarned: number;
    totalReferrals: number;
    commissionRate: string;
  };
  history: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
  }>;
}

interface ReferralAttribution {
  partnerId: string;
  merchantId: string;
  referralCode: string;
  metadata: Record<string, unknown>;
  signupCompletedAt?: Date;
  firstPaymentAt?: Date;
}

/**
 * Referral Service - Seller-to-seller referral program management
 * Handles referral code generation, tracking, reward distribution, and affiliate analytics
 * Supports automated ₦1,000 credit rewards for successful referrals
 */
export class ReferralService {
  constructor(private readonly db: ExtendedPrismaClient = prisma) {}

  /**
   * Retrieves or generates a unique referral code for a store
   * Uses nanoid(8) for code generation, stores in settings
   * 
   * @param storeId - The store/merchant ID
   * @returns Unique uppercase referral code (e.g., "A7B9C2D1")
   */
  async getOrCreateCode(storeId: string): Promise<string> {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const settings = this.toObject(store?.settings);
      const existingCode = this.getReferralCodeFromSettings(settings);
      
      if (existingCode) {
        return existingCode;
      }

      const code = nanoid(8).toUpperCase();
      await this.db.store.update({
        where: { id: storeId },
        data: {
          settings: {
            ...settings,
            referralCode: code,
          },
        },
      });

      return code;
    } catch (error) {
      logger.error('[ReferralService.getOrCreateCode] Failed to get or create code', { storeId });
      throw error;
    }
  }

  /**
   * Fetches comprehensive affiliate statistics for a store
   * Includes referral code, earnings, total referrals, and reward history
   * 
   * @param storeId - The store/merchant ID
   * @returns Complete affiliate dashboard data with stats and history
   */
  async getStats(storeId: string): Promise<ReferralStats> {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const referralCode = this.getReferralCodeFromSettings(store?.settings);

      const [referrals, credits] = await Promise.all([
        this.db.referralAttribution.findMany({
          where: {
            metadata: {
              path: ['referrerStoreId'],
              equals: storeId,
            },
          },
          select: { signupCompletedAt: true, firstPaymentAt: true },
        }),
        this.db.ledgerEntry.findMany({
          where: {
            storeId,
            referenceType: 'REFERRAL_REWARD',
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalEarned = credits.reduce((sum: number, c: any) => sum + Number(c.amount), 0);

      return {
        referralCode,
        stats: {
          totalEarned,
          totalReferrals: referrals.length,
          commissionRate: '₦1,000 credit',
        },
        history: credits.map((c: any) => ({
          id: c.id,
          date: c.createdAt.toISOString(),
          amount: Number(c.amount),
          description: c.description || 'Referral Reward',
        })),
      };
    } catch (error) {
      logger.error('[ReferralService.getStats] Failed to fetch stats', { storeId });
      throw error;
    }
  }

  /**
   * Records a new referral during onboarding process
   * Validates referral code and prevents self-referrals
   * 
   * @param refereeStoreId - The store being referred (new merchant)
   * @param referralCode - The referrer's unique code
   * @returns Success status or error message
   */
  async trackReferral(refereeStoreId: string, referralCode: string) {
    try {
      const referrer = await this.db.store.findFirst({
        where: {
          settings: {
            path: ['referralCode'],
            equals: referralCode,
          },
        },
      });

      if (!referrer) {
        return { success: false, error: 'Invalid referral code' };
      }

      if (referrer.id === refereeStoreId) {
        return { success: false, error: 'Self-referral not allowed' };
      }

      await this.db.referralAttribution.create({
        data: {
          partnerId: 'system',
          merchantId: refereeStoreId,
          referralCode: referralCode,
          metadata: { referrerStoreId: referrer.id },
        },
      });

      return { success: true };
    } catch (error) {
      logger.error('[ReferralService.trackReferral] Failed to track referral', { refereeStoreId, referralCode });
      throw error;
    }
  }

  /**
   * Triggers reward logic when a referee makes their first payment
   * Credits ₦1,000 to referrer's ledger account
   * Prevents duplicate rewards via firstPaymentAt check
   * 
   * @param refereeStoreId - The store that made payment
   * @returns Void or undefined if no reward applicable
   */
  async processRefereePayment(refereeStoreId: string) {
    try {
      const attribution = await this.db.referralAttribution.findUnique({
        where: { merchantId: refereeStoreId },
      });

      // Already rewarded or no attribution found
      if (!attribution || attribution.firstPaymentAt) {
        return;
      }

      // Mark as paid
      await this.db.referralAttribution.update({
        where: { id: attribution.id },
        data: { firstPaymentAt: new Date() },
      });

      const referrerStoreId = (attribution.metadata as Record<string, unknown>)
        ?.referrerStoreId;
      
      if (!referrerStoreId) {
        return;
      }

      // Credit referrer with ₦1,000
      await this.db.ledgerEntry.create({
        data: {
          storeId: String(referrerStoreId),
          amount: 1000,
          currency: 'NGN',
          direction: 'IN',
          account: 'CREDITS',
          referenceType: 'REFERRAL_REWARD',
          referenceId: refereeStoreId,
          description: `Referral reward for store ${refereeStoreId}`,
          metadata: { type: 'REFERRAL_REWARD' },
        },
      });

      logger.info('[ReferralService.processRefereePayment] Referral reward processed', {
        referrerStoreId: String(referrerStoreId),
        refereeStoreId,
        amount: 1000,
      });
    } catch (error) {
      logger.error('[ReferralService.processRefereePayment] Failed to process payment', { refereeStoreId });
      throw error;
    }
  }

  /**
   * Generate referral code (alias for getOrCreateCode)
   * Convenience method for API consistency
   * 
   * @param storeId - The store/merchant ID
   * @returns Unique uppercase referral code
   */
  async generateCode(storeId: string): Promise<string> {
    return this.getOrCreateCode(storeId);
  }

  /**
   * Calculate monthly discount based on successful referrals
   * Rule: ₦1,000 discount per successful referral this month
   * 
   * @param storeId - The store/merchant ID
   * @returns Total monthly discount amount in NGN
   */
  async getMonthlyDiscount(storeId: string): Promise<number> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const rewardedReferrals = await this.db.referralAttribution.count({
        where: {
          metadata: {
            path: ['referrerStoreId'],
            equals: storeId,
          },
          firstPaymentAt: {
            gte: startOfMonth,
          },
        },
      });

      // Rule: 1,000 NGN discount per successful referral this month
      return rewardedReferrals * 1000;
    } catch (error) {
      logger.error('[ReferralService.getMonthlyDiscount] Failed to calculate discount', { storeId });
      throw error;
    }
  }

  /**
   * Get list of all referred stores (referee list)
   * Shows signup dates and payment status
   * 
   * @param storeId - The referrer store ID
   * @returns List of referred stores with their details
   */
  async getReferredStores(storeId: string) {
    try {
      const referrals = await this.db.referralAttribution.findMany({
        where: {
          metadata: {
            path: ['referrerStoreId'],
            equals: storeId,
          },
        },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              slug: true,
              industrySlug: true,
              plan: true,
              createdAt: true,
            },
          },
        },
        orderBy: { signupCompletedAt: 'desc' },
      });

      return {
        data: referrals.map((r) => ({
          id: r.merchant.id,
          name: r.merchant.name,
          slug: r.merchant.slug,
          industrySlug: r.merchant.industrySlug,
          plan: r.merchant.plan,
          signupCompletedAt: r.signupCompletedAt?.toISOString() || null,
          firstPaymentAt: r.firstPaymentAt?.toISOString() || null,
          hasPaid: !!r.firstPaymentAt,
        })),
        total: referrals.length,
        converted: referrals.filter((r) => r.firstPaymentAt).length,
        conversionRate: referrals.length > 0
          ? (referrals.filter((r) => r.firstPaymentAt).length / referrals.length) * 100
          : 0,
      };
    } catch (error) {
      logger.error('[ReferralService.getReferredStores] Failed to fetch referred stores', { storeId });
      throw error;
    }
  }

  /**
   * Calculate pending rewards (unpaid referrals)
   * Shows potential earnings from referrals who haven't paid yet
   * 
   * @param storeId - The referrer store ID
   * @returns Pending reward amount and count
   */
  async getPendingRewards(storeId: string) {
    try {
      const unpaidReferrals = await this.db.referralAttribution.count({
        where: {
          metadata: {
            path: ['referrerStoreId'],
            equals: storeId,
          },
          firstPaymentAt: null,
        },
      });

      const pendingAmount = unpaidReferrals * 1000;

      return {
        pendingAmount,
        unpaidReferrals,
        message: `You will earn ₦${pendingAmount} when ${unpaidReferrals} referred store(s) make their first payment`,
      };
    } catch (error) {
      logger.error('[ReferralService.getPendingRewards] Failed to fetch pending rewards', { storeId });
      throw error;
    }
  }

  // Helper methods
  private toObject(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private getReferralCodeFromSettings(settings: Record<string, unknown>): string | undefined {
    const obj = settings;
    const code = obj.referralCode;
    return typeof code === 'string' ? code : undefined;
  }
}

// Export singleton instance for backwards compatibility
export const referralService = new ReferralService();
