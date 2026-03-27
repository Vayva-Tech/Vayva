/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dunning Service - PURE BUSINESS LOGIC ONLY (NO DATABASE)
 * Database operations moved to Backend/core-api/src/services/subscriptions/dunning.service.ts
 */
// import { sendPaymentFailed, sendPaymentRecovered, sendSubscriptionEnded } from "@vayva/emails";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface DunningConfig {
  storeId: string;
  boxId?: string; // null = store-level default
  retrySchedule: number[]; // days after first failure: [1, 3, 7, 14]
  maxRetries: number;
  finalAction: "cancel" | "pause" | "notify_only";
  notifyCustomer: boolean;
  notifyOwner: boolean;
}

export interface DunningAttempt {
  id: string;
  subscriptionId: string;
  attemptNumber: number;
  status: "pending" | "processing" | "success" | "failed" | "exhausted";
  amount: number;
  error?: string;
  scheduledAt: Date;
  processedAt?: Date;
  nextAttemptAt?: Date;
}

export interface DunningResult {
  subscriptionId: string;
  recovered: boolean;
  totalAttempts: number;
  finalStatus: "recovered" | "cancelled" | "paused" | "pending";
}

// ────────────────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────────────────

export class DunningService {
  private readonly DEFAULT_RETRY_SCHEDULE = [1, 3, 7, 14]; // days
  private readonly DEFAULT_MAX_RETRIES = 4;

  /**
   * Initiate dunning process for a failed payment
   */
  async initiateDunning(
    subscriptionId: string,
    failedAmount: number,
    failureReason?: string
  ): Promise<DunningAttempt> {
    const subscription = await db.boxSubscription?.findUnique({
      where: { id: subscriptionId },
      include: { box: true },
    });

    if (!subscription) throw new Error("Subscription not found");

    const config = await this.getConfig(
      subscription.box?.storeId ?? "",
      subscription.boxId
    );

    // Schedule first retry
    const nextAttemptAt = this.getNextAttemptDate(1, config.retrySchedule);

    const attempt: DunningAttempt = {
      id: `dun-${Date.now()}`,
      subscriptionId,
      attemptNumber: 1,
      status: "pending",
      amount: failedAmount,
      error: failureReason,
      scheduledAt: new Date(),
      nextAttemptAt,
    };

    // Persist to dunning log
    await (prisma as any).dunningAttempt?.create({ data: attempt }).catch(() => {});

    // Mark subscription as past-due
    await db.boxSubscription?.update({
      where: { id: subscriptionId },
      data: { status: "paused" },
    });

    console.warn(
      `[Dunning] Initiated for subscription ${subscriptionId}. Next attempt: ${nextAttemptAt}`
    );

    if (config.notifyCustomer) {
      await this.notifyCustomer(subscription, "payment_failed", attempt);
    }

    return attempt;
  }

  /**
   * Process a dunning retry attempt
   */
  async processRetry(dunningAttemptId: string): Promise<DunningResult> {
    const attempt = await (prisma as any).dunningAttempt?.findUnique({
      where: { id: dunningAttemptId },
      include: { subscription: { include: { box: true } } },
    });

    if (!attempt) {
      return { subscriptionId: "", recovered: false, totalAttempts: 0, finalStatus: "cancelled" };
    }

    const subscription = attempt.subscription;
    const config = await this.getConfig(
      subscription.box?.storeId ?? "",
      subscription.boxId
    );

    // Try to charge
    const paymentResult = await this.attemptCharge(
      subscription.id,
      attempt.amount,
      subscription.paymentMethod
    );

    if (paymentResult.success) {
      // Recovered!
      await (prisma as any).dunningAttempt?.update({
        where: { id: dunningAttemptId },
        data: { status: "success", processedAt: new Date() },
      }).catch(() => {});

      // Reactivate subscription
      await db.boxSubscription?.update({
        where: { id: subscription.id },
        data: { status: "active" },
      });

      await this.notifyCustomer(subscription, "payment_recovered", attempt);

      return {
        subscriptionId: subscription.id,
        recovered: true,
        totalAttempts: attempt.attemptNumber,
        finalStatus: "recovered",
      };
    }

    // Failed again
    const nextAttemptNum = attempt.attemptNumber + 1;

    if (nextAttemptNum > config.maxRetries) {
      // Exhausted
      await (prisma as any).dunningAttempt?.update({
        where: { id: dunningAttemptId },
        data: {
          status: "exhausted",
          processedAt: new Date(),
          error: paymentResult.error,
        },
      }).catch(() => {});

      await this.handleExhausted(subscription, config);

      return {
        subscriptionId: subscription.id,
        recovered: false,
        totalAttempts: attempt.attemptNumber,
        finalStatus: config.finalAction === "cancel" ? "cancelled" : "paused",
      };
    }

    // Schedule next attempt
    const nextAttemptAt = this.getNextAttemptDate(nextAttemptNum, config.retrySchedule);

    await (prisma as any).dunningAttempt?.update({
      where: { id: dunningAttemptId },
      data: {
        status: "failed",
        processedAt: new Date(),
        error: paymentResult.error,
      },
    }).catch(() => {});

    // Create next attempt
    const nextAttempt: DunningAttempt = {
      id: `dun-${Date.now()}-${nextAttemptNum}`,
      subscriptionId: subscription.id,
      attemptNumber: nextAttemptNum,
      status: "pending",
      amount: attempt.amount,
      scheduledAt: new Date(),
      nextAttemptAt,
    };

    await (prisma as any).dunningAttempt?.create({ data: nextAttempt }).catch(() => {});

    return {
      subscriptionId: subscription.id,
      recovered: false,
      totalAttempts: attempt.attemptNumber,
      finalStatus: "pending",
    };
  }

  /**
   * Process all due dunning retries (called by a scheduler)
   */
  async processDueRetries(): Promise<{
    processed: number;
    recovered: number;
    exhausted: number;
  }> {
    const dueAttempts = await (prisma as any).dunningAttempt?.findMany({
      where: {
        status: "pending",
        nextAttemptAt: { lte: new Date() },
      },
    }) ?? [];

    const stats = { processed: 0, recovered: 0, exhausted: 0 };

    for (const attempt of dueAttempts) {
      stats.processed++;
      const result = await this.processRetry(attempt.id);
      if (result.recovered) stats.recovered++;
      if (result.finalStatus === "cancelled" || result.finalStatus === "paused") stats.exhausted++;
    }

    console.warn(`[Dunning] Processed ${stats.processed} retries. Recovered: ${stats.recovered}`);
    return stats;
  }

  /**
   * Get dunning history for a subscription
   */
  async getHistory(subscriptionId: string): Promise<DunningAttempt[]> {
    const attempts = await (prisma as any).dunningAttempt?.findMany({
      where: { subscriptionId },
      orderBy: { scheduledAt: "asc" },
    }) ?? [];

    return attempts.map((a: any) => ({
      id: String(a.id),
      subscriptionId: String(a.subscriptionId),
      attemptNumber: Number(a.attemptNumber),
      status: a.status as DunningAttempt["status"],
      amount: Number(a.amount),
      error: a.error ? String(a.error) : undefined,
      scheduledAt: a.scheduledAt as Date,
      processedAt: a.processedAt as Date | undefined,
      nextAttemptAt: a.nextAttemptAt as Date | undefined,
    }));
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async getConfig(storeId: string, boxId?: string): Promise<DunningConfig> {
    // Try box-level config, then store-level, then defaults
    const config = await (prisma as any).dunningConfig?.findFirst({
      where: { storeId, boxId: boxId ?? null },
    });

    return {
      storeId,
      boxId,
      retrySchedule: config?.retrySchedule ?? this.DEFAULT_RETRY_SCHEDULE,
      maxRetries: config?.maxRetries ?? this.DEFAULT_MAX_RETRIES,
      finalAction: config?.finalAction ?? "cancel",
      notifyCustomer: config?.notifyCustomer ?? true,
      notifyOwner: config?.notifyOwner ?? true,
    };
  }

  private getNextAttemptDate(attemptNumber: number, schedule: number[]): Date {
    const daysOffset = schedule[Math.min(attemptNumber - 1, schedule.length - 1)] ?? 14;
    return new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
  }

  private async attemptCharge(
    subscriptionId: string,
    amount: number,
    _paymentMethod: unknown
  ): Promise<{ success: boolean; error?: string; transactionId?: string }> {
    // Integrate with actual payment provider (Paystack/Stripe)
    console.warn(`[Dunning] Attempting charge for ${subscriptionId}: ₦${amount / 100}`);
    // Mock: 30% success rate on retries
    const success = Math.random() > 0.7;
    return success
      ? { success: true, transactionId: `txn_retry_${Date.now()}` }
      : { success: false, error: "Card declined" };
  }

  private async handleExhausted(
    subscription: Record<string, unknown>,
    config: DunningConfig
  ): Promise<void> {
    if (config.finalAction === "cancel") {
      await db.boxSubscription?.update({
        where: { id: String(subscription.id) },
        data: {
          status: "cancelled",
          cancellation: {
            reason: "payment_failed",
            feedback: "Automatic cancellation after dunning exhausted",
            cancelledAt: new Date(),
          },
        },
      });
    } else if (config.finalAction === "pause") {
      await db.boxSubscription?.update({
        where: { id: String(subscription.id) },
        data: { status: "paused" },
      });
    }

    if (config.notifyCustomer) {
      await this.notifyCustomer(subscription, "subscription_ended", null);
    }
  }

  private async notifyCustomer(
    subscription: Record<string, unknown>,
    event: string,
    attempt: DunningAttempt | null
  ): Promise<void> {
    try {
      const box = subscription.box as Record<string, unknown> | undefined;
      const storeId = box?.storeId as string | undefined;
      
      if (!storeId) {
        console.warn('[Dunning] Cannot send email: storeId not found');
        return;
      }

      // Get store owner email
      const store = await (prisma as any).store?.findUnique({
        where: { id: storeId },
        include: { owner: true },
      }).catch(() => null);

      const ownerEmail = store?.owner?.email as string | undefined;
      if (!ownerEmail) {
        console.warn('[Dunning] Cannot send email: owner email not found');
        return;
      }

      const storeName = (store?.name as string) || 'Your Store';
      const currency = 'NGN';

      switch (event) {
        case 'payment_failed': {
          if (!attempt) break;
          const retryDate = attempt.nextAttemptAt 
            ? new Date(attempt.nextAttemptAt).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'soon';
          
          await sendPaymentFailed(ownerEmail, {
            storeName,
            amount: String(attempt.amount),
            currency,
            retryDate,
            billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
          });
          
          console.warn(`[Dunning] Sent payment failed email to ${ownerEmail}`);
          break;
        }

        case 'payment_recovered': {
          if (!attempt) break;
          
          await sendPaymentRecovered(ownerEmail, {
            storeName,
            amount: String(attempt.amount),
            currency,
          });
          
          console.warn(`[Dunning] Sent payment recovered email to ${ownerEmail}`);
          break;
        }

        case 'subscription_ended': {
          await sendSubscriptionEnded(ownerEmail, {
            storeName,
            planName: (subscription.planName as string) || 'Premium',
            reactivationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/reactivate`,
          });
          
          console.warn(`[Dunning] Sent subscription ended email to ${ownerEmail}`);
          break;
        }

        default:
          console.warn(`[Dunning] Unknown email event: ${event}`);
      }
    } catch (error) {
      console.error('[Dunning] Failed to send customer notification:', error);
    }
  }
}

export const dunningService = new DunningService();
