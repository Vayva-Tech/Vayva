import { prisma } from "@vayva/db";
/**
 * Vayva AI Revenue & Protection Service
 */
interface TrialEligibilitySignal {
  ipHash: string;
  fingerprintHash: string;
  emailDomain?: string;
}

export class RevenueService {
  /**
   * Check if a merchant is eligible for a new free trial
   * Prevents "trial farming" while remaining fair to shared networks
   */
  static async checkTrialEligibility(signal: TrialEligibilitySignal) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 90);
    const pattern = await prisma.signupAbuseSignal.findFirst({
      where: {
        ipHash: signal.ipHash,
        fingerprintHash: signal.fingerprintHash,
        lastSignupAt: { gte: thresholdDate },
      },
    });
    if (pattern && pattern.signupCount >= 2) {
      return {
        allowed: false,
        reason:
          "Multiple trials detected from this device. To protect our community, we limit free trials to 2 per household/business every 90 days. Please upgrade to a Growth plan to continue.",
      };
    }
    // Upsert signal logic to track counts
    await prisma.signupAbuseSignal.upsert({
      where: { id: pattern?.id || "new" }, // Note: In a real app use a composite unique key for ip+fingerprint
      create: {
        ipHash: signal.ipHash,
        fingerprintHash: signal.fingerprintHash,
        emailDomain: signal.emailDomain ?? "",
        signupCount: 1,
        lastSignupAt: new Date(),
      },
      update: {
        signupCount: { increment: 1 },
        lastSignupAt: new Date(),
      },
    });
    return { allowed: true };
  }
  /**
   * Purchase a 1,000 Message Add-on Pack (₦5,000)
   */
  static async purchaseAddon(storeId: string, transactionId: string) {
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });
    if (!sub) throw new Error("No active subscription found");
    await prisma.aiAddonPurchase.create({
      data: {
        storeId,
        subscriptionId: sub.id,
        packType: "MESSAGES_1000",
        priceKobo: BigInt(500000), // ₦5,000 in Kobo
        transactionId,
        messagesAdded: 1000,
        imagesAdded: 100,
      },
    });
    // The AiUsageService logic handles checking if current month's messages used < limit + addons
    // In the next step we'll update AiUsageService to respect addon counts.
  }
  /**
   * Handle Trial Expiry Transition
   */
  static async expireTrial(storeId: string) {
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });
    if (!sub || sub.status !== "TRIAL_ACTIVE") return;
    // Transitions to Grace state
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + 1); // 1-day grace
    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        status: "TRIAL_EXPIRED_GRACE",
        graceEndsAt: graceEnd,
      },
    });
  }
  /**
   * Final Closure after Grace
   */
  static async closeAccount(storeId: string) {
    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        status: "SOFT_CLOSED",
        closedAt: new Date(),
      },
    });
    // This state should trigger the "Pleasant Goodbye" UI
    // and disable the AI + storefront published state in the routing layer.
  }
}
