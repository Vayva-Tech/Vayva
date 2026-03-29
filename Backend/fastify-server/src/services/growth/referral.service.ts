import { prisma } from '@vayva/db';
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

export class ReferralService {
  constructor(private readonly db = prisma) {}

  /**
   * Retrieves or generates a unique referral code for a store
   */
  async getOrCreateCode(storeId: string): Promise<string> {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    const settings = (store?.settings as Record<string, unknown>) || {};
    const existingCode = typeof settings.referralCode === 'string' ? settings.referralCode : undefined;

    if (existingCode) return existingCode;

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

    logger.info(`[Referral] Generated code ${code} for store ${storeId}`);

    return code;
  }

  /**
   * Fetches affiliate stats for a store
   * Returns referral code, earnings, and reward history
   */
  async getStats(storeId: string): Promise<ReferralStats> {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    const settings = (store?.settings as Record<string, unknown>) || {};
    const referralCode = typeof settings.referralCode === 'string' ? settings.referralCode : undefined;

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

    const totalEarned = credits.reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      referralCode,
      stats: {
        totalEarned,
        totalReferrals: referrals.length,
        commissionRate: '₦1,000 credit',
      },
      history: credits.map((c) => ({
        id: c.id,
        date: c.createdAt.toISOString(),
        amount: Number(c.amount),
        description: c.description || 'Referral Reward',
      })),
    };
  }

  /**
   * Records a new referral during onboarding
   * Validates referral code and prevents self-referral
   */
  async trackReferral(refereeStoreId: string, referralCode: string) {
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
        referralCode,
        metadata: { referrerStoreId: referrer.id },
      },
    });

    logger.info(`[Referral] Tracked referral from ${referrer.id} to ${refereeStoreId}`);

    return { success: true };
  }

  /**
   * Triggers reward logic when a referee makes their first payment
   * Awards ₦1,000 credit to the referrer
   */
  async processRefereePayment(refereeStoreId: string): Promise<void> {
    const attribution = await this.db.referralAttribution.findUnique({
      where: { merchantId: refereeStoreId },
    });

    if (!attribution || attribution.firstPaymentAt) return;

    // Mark as paid
    await this.db.referralAttribution.update({
      where: { id: attribution.id },
      data: { firstPaymentAt: new Date() },
    });

    const referrerStoreId = (attribution.metadata as Record<string, unknown>)
      ?.referrerStoreId;

    if (!referrerStoreId) return;

    // Award referral reward
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

    logger.info(`[Referral] Processed reward for ${String(referrerStoreId)} - referee: ${refereeStoreId}`);
  }

  /**
   * Generate referral code (alias for getOrCreateCode)
   */
  async generateCode(storeId: string): Promise<string> {
    return this.getOrCreateCode(storeId);
  }

  /**
   * Calculate monthly discount based on successful referrals
   * Returns ₦1,000 discount per rewarded referral this month
   */
  async getMonthlyDiscount(storeId: string): Promise<number> {
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
    const discount = rewardedReferrals * 1000;

    logger.info(`[Referral] Monthly discount for store ${storeId}: ₦${discount}`);

    return discount;
  }
}
