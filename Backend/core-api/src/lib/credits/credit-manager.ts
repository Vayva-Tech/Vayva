/**
 * Credit Manager Service
 * 
 * Handles credit allocation, tracking, and deduction for the Vayva platform.
 * Used for metering AI usage, template changes, and other premium features.
 */

import { prisma } from "@vayva/db";
import { readStarterFirstMonthFreeEnabled } from "@/lib/feature-flags/read-starter-first-month-free";

export interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
  message?: string;
}

export interface CreditUsageResult {
  success: boolean;
  remaining: number;
  message?: string;
}

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startDate: Date | null;
  endDate: Date | null;
  expired: boolean;
}

export class CreditManager {
  /**
   * Get monthly credit allocation based on plan
   */
  getMonthlyCreditsForPlan(plan: string): number {
    switch (plan.toUpperCase()) {
      case 'FREE':
        return 0;
      case 'STARTER':
        return 5000;
      case 'PRO':
        return 10000;
      default:
        return 0;
    }
  }

  /**
   * Check if store has enough credits for an action
   */
  async checkCredits(storeId: string, cost: number): Promise<CreditCheckResult> {
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });

    if (!sub) {
      return {
        allowed: false,
        remaining: 0,
        reason: "no_subscription",
        message: "AI subscription not found for store.",
      };
    }

    const remaining = sub.plan.monthlyRequestLimit - sub.monthRequestsUsed;
    if (remaining >= cost) {
      return { allowed: true, remaining: remaining - cost };
    }

    return {
      allowed: false,
      remaining,
      reason: "insufficient_credits",
      message: `You need ${cost} credits but have only ${remaining} remaining this month.`,
    };
  }

  /**
   * Deduct credits from allocation and log usage
   */
  async useCredits(
    storeId: string,
    cost: number,
    feature: string,
    description: string
  ): Promise<CreditUsageResult> {
    const check = await this.checkCredits(storeId, cost);
    
    if (!check.allowed) {
      return { 
        success: false, 
        remaining: check.remaining,
        message: check.message 
      };
    }

    void feature;
    void description;

    // Update AI subscription usage counters
    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: { monthRequestsUsed: { increment: cost } },
    });

    return { 
      success: true, 
      remaining: check.remaining - cost 
    };
  }

  /**
   * Initialize or reset credit allocation for a store
   */
  async initializeAllocation(
    storeId: string,
    plan: string,
    resetDate?: Date
  ): Promise<void> {
    void resetDate;
    // Credits are derived from `merchantAiSubscription.plan` + usage counters.
    // Allocation initialization is handled when provisioning/upgrading AI subscription.
    void storeId;
    void plan;
  }

  /**
   * Reset credits on monthly renewal
   */
  async resetMonthlyCredits(storeId: string): Promise<number> {
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });
    if (!sub) return 0;

    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: { monthRequestsUsed: 0 },
    });

    return sub.plan.monthlyRequestLimit;
  }

  /**
   * Get current credit balance and usage
   */
  async getBalance(storeId: string): Promise<{
    monthlyCredits: number;
    usedCredits: number;
    remainingCredits: number;
    resetDate: Date | null;
    plan: string;
  } | null> {
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });
    if (!sub) return null;

    const remaining = sub.plan.monthlyRequestLimit - sub.monthRequestsUsed;
    return {
      monthlyCredits: sub.plan.monthlyRequestLimit,
      usedCredits: sub.monthRequestsUsed,
      remainingCredits: remaining,
      resetDate: null,
      plan: sub.planKey,
    };
  }

  /**
   * Get usage history for a store
   */
  async getUsageHistory(
    storeId: string,
    limit: number = 50
  ): Promise<Array<{
    id: string;
    amount: number;
    feature: string;
    description: string;
    createdAt: Date;
  }>> {
    void storeId;
    void limit;
    // No dedicated credit usage log model exists in the platform schema.
    return [];
  }

  /**
   * Auto-reset expired allocations (cron job helper)
   */
  async autoResetExpiredAllocations(): Promise<number> {
    // Monthly resets are performed by `ai-usage.service` (scheduled) against merchantAiSubscription.
    return 0;
  }

  /**
   * Initialize trial for a store
   */
  async initializeTrial(storeId: string): Promise<TrialStatus> {
    const existing = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });
    if (!existing) throw new Error(`AI subscription for ${storeId} not found`);
    if (existing.trialExpiresAt && existing.trialExpiresAt > new Date()) {
      return await this.getTrialStatus(storeId);
    }

    const starterExtended = await readStarterFirstMonthFreeEnabled();
    const trialDays = starterExtended ? 30 : 7;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + trialDays);

    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        trialStartedAt: now,
        trialExpiresAt: endDate,
      },
    });

    return {
      isActive: true,
      daysRemaining: trialDays,
      startDate: now,
      endDate,
      expired: false,
    };
  }

  /**
   * Get trial status for a store
   */
  async getTrialStatus(storeId: string): Promise<TrialStatus> {
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      select: { trialStartedAt: true, trialExpiresAt: true },
    });

    if (!sub || !sub.trialStartedAt || !sub.trialExpiresAt) {
      return {
        isActive: false,
        daysRemaining: 0,
        startDate: null,
        endDate: null,
        expired: true,
      };
    }

    const now = new Date();
    const endDate = sub.trialExpiresAt;
    const isExpired = now > endDate;

    if (isExpired) {
      return {
        isActive: false,
        daysRemaining: 0,
        startDate: sub.trialStartedAt,
        endDate,
        expired: true,
      };
    }

    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isActive: true,
      daysRemaining,
      startDate: sub.trialStartedAt,
      endDate,
      expired: false,
    };
  }

  /**
   * Check if store is on active trial
   */
  async isTrialActive(storeId: string): Promise<boolean> {
    const status = await this.getTrialStatus(storeId);
    return status.isActive && !status.expired;
  }

  /**
   * Expire trial manually (for upgrade flows)
   */
  async expireTrial(storeId: string): Promise<void> {
    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: { trialExpiresAt: new Date() },
    });
  }

  /**
   * Upgrade store to paid plan
   */
  async upgradeToPaidPlan(
    storeId: string,
    plan: 'STARTER' | 'PRO'
  ): Promise<void> {
    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        planKey: plan,
        monthRequestsUsed: 0,
        trialExpiresAt: new Date(),
      },
    });
  }
}

// Export singleton instance for convenience
export const creditManager = new CreditManager();
