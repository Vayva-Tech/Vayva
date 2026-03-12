import { prisma } from "@vayva/db";
import { nanoid } from "nanoid";

function toObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getReferralCodeFromSettings(settings: unknown): string | undefined {
  const obj = toObject(settings);
  const code = obj.referralCode;
  return typeof code === "string" ? code : undefined;
}
/**
 * Service to handle seller-to-seller referrals and rewards.
 */
export class ReferralService {
  /**
   * Retrieves or generates a unique referral code for a store.
   */
  static async getOrCreateCode(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });
    const settings = toObject(store?.settings);
    const existingCode = getReferralCodeFromSettings(settings);
    if (existingCode) return existingCode;
    const code = nanoid(8).toUpperCase();
    await prisma.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...settings,
          referralCode: code,
        },
      },
    });
    return code;
  }
  /**
   * Fetches affiliate stats for a store.
   */
  static async getStats(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });
    const referralCode = getReferralCodeFromSettings(store?.settings);
    const [referrals, credits] = await Promise.all([
      prisma.referralAttribution.findMany({
        where: {
          metadata: {
            path: ["referrerStoreId"],
            equals: storeId,
          },
        },
        select: { signupCompletedAt: true, firstPaymentAt: true },
      }),
      prisma.ledgerEntry.findMany({
        where: {
          storeId,
          referenceType: "REFERRAL_REWARD",
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const totalEarned = credits.reduce((sum, c) => sum + Number(c.amount), 0);
    return {
      referralCode,
      stats: {
        totalEarned,
        totalReferrals: referrals.length,
        commissionRate: "₦1,000 credit",
      },
      history: credits.map((c) => ({
        id: c.id,
        date: c.createdAt.toISOString(),
        amount: Number(c.amount),
        description: c.description || "Referral Reward",
      })),
    };
  }
  /**
   * Records a new referral during onboarding.
   */
  static async trackReferral(refereeStoreId: string, referralCode: string) {
    const referrer = await prisma.store.findFirst({
      where: {
        settings: {
          path: ["referralCode"],
          equals: referralCode,
        },
      },
    });
    if (!referrer) return { success: false, error: "Invalid referral code" };
    if (referrer.id === refereeStoreId)
      return { success: false, error: "Self-referral not allowed" };
    await prisma.referralAttribution.create({
      data: {
        partnerId: "system",
        merchantId: refereeStoreId,
        referralCode: referralCode,
        metadata: { referrerStoreId: referrer.id },
      },
    });
    return { success: true };
  }
  /**
   * Triggers the reward logic when a referee makes their first payment.
   */
  static async processRefereePayment(refereeStoreId: string) {
    const attribution = await prisma.referralAttribution.findUnique({
      where: { merchantId: refereeStoreId },
    });
    if (!attribution || attribution.firstPaymentAt) return;
    await prisma.referralAttribution.update({
      where: { id: attribution.id },
      data: { firstPaymentAt: new Date() },
    });
    const referrerStoreId = (attribution.metadata as Record<string, unknown>)
      ?.referrerStoreId;
    if (!referrerStoreId) return;
    await prisma.ledgerEntry.create({
      data: {
        storeId: String(referrerStoreId),
        amount: 1000,
        currency: "NGN",
        direction: "IN",
        account: "CREDITS",
        referenceType: "REFERRAL_REWARD",
        referenceId: refereeStoreId,
        description: `Referral reward for store ${refereeStoreId}`,
        metadata: { type: "REFERRAL_REWARD" },
      },
    });
  }
  static async generateCode(storeId: string) {
    return this.getOrCreateCode(storeId);
  }
  static async getMonthlyDiscount(storeId: string) {
    // Real implementation: Count rewarded referrals for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rewardedReferrals = await prisma.referralAttribution.count({
      where: {
        metadata: {
          path: ["referrerStoreId"],
          equals: storeId,
        },
        firstPaymentAt: {
          gte: startOfMonth,
        },
      },
    });

    // Rule: 1,000 NGN discount per successful referral this month
    return rewardedReferrals * 1000;
  }
}
