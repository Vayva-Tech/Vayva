/**
 * Credit Manager Service
 * 
 * Handles credit allocation, tracking, and deduction for the Vayva platform.
 * Used for metering AI usage, template changes, and other premium features.
 */

import { prisma } from "@vayva/db";

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
    const allocation = await prisma.creditAllocation.findUnique({
      where: { storeId },
    });

    if (!allocation) {
      return { 
        allowed: false, 
        remaining: 0, 
        reason: 'no_allocation',
        message: 'Credit allocation not found. Please contact support.'
      };
    }

    const remaining = allocation.monthlyCredits - allocation.usedCredits;
    
    if (remaining >= cost) {
      return { 
        allowed: true, 
        remaining: remaining - cost 
      };
    }

    return {
      allowed: false,
      remaining,
      reason: 'insufficient_credits',
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

    // Update allocation
    await prisma.creditAllocation.update({
      where: { storeId },
      data: { 
        usedCredits: { increment: cost },
        updatedAt: new Date()
      },
    });

    // Log usage
    await prisma.creditUsageLog.create({
      data: {
        storeId,
        amount: cost,
        feature,
        description,
      },
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
    const monthlyCredits = this.getMonthlyCreditsForPlan(plan);
    const nextReset = resetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days

    const existing = await prisma.creditAllocation.findUnique({
      where: { storeId },
    });

    if (existing) {
      await prisma.creditAllocation.update({
        where: { storeId },
        data: {
          plan: plan.toUpperCase(),
          monthlyCredits,
          usedCredits: 0,
          resetDate: nextReset,
        },
      });
    } else {
      await prisma.creditAllocation.create({
        data: {
          storeId,
          plan: plan.toUpperCase(),
          monthlyCredits,
          usedCredits: 0,
          resetDate: nextReset,
        },
      });
    }
  }

  /**
   * Reset credits on monthly renewal
   */
  async resetMonthlyCredits(storeId: string): Promise<number> {
    const allocation = await prisma.creditAllocation.findUnique({
      where: { storeId },
    });

    if (!allocation) {
      return 0;
    }

    const newResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
    
    await prisma.creditAllocation.update({
      where: { storeId },
      data: {
        usedCredits: 0,
        resetDate: newResetDate,
      },
    });

    return allocation.monthlyCredits;
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
    const allocation = await prisma.creditAllocation.findUnique({
      where: { storeId },
    });

    if (!allocation) {
      return null;
    }

    const remaining = allocation.monthlyCredits - allocation.usedCredits;

    return {
      monthlyCredits: allocation.monthlyCredits,
      usedCredits: allocation.usedCredits,
      remainingCredits: remaining,
      resetDate: allocation.resetDate,
      plan: allocation.plan,
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
    const logs = await prisma.creditUsageLog.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        amount: true,
        feature: true,
        description: true,
        createdAt: true,
      },
    });

    return logs;
  }

  /**
   * Auto-reset expired allocations (cron job helper)
   */
  async autoResetExpiredAllocations(): Promise<number> {
    const now = new Date();
    const expired = await prisma.creditAllocation.findMany({
      where: {
        resetDate: {
          lt: now,
        },
      },
    });

    let resetCount = 0;
    for (const allocation of expired) {
      await this.resetMonthlyCredits(allocation.storeId);
      resetCount++;
    }

    return resetCount;
  }

  /**
   * Initialize trial for a store
   */
  async initializeTrial(storeId: string): Promise<TrialStatus> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }

    // Check if trial already exists
    if (store.trialStartDate) {
      return this.getTrialStatus(storeId);
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 14); // 14 days trial

    await prisma.store.update({
      where: { id: storeId },
      data: {
        trialStartDate: now,
        trialEndDate: endDate,
        trialExpired: false,
      },
    });

    // Create credit allocation for FREE plan (0 credits)
    await prisma.creditAllocation.upsert({
      where: { storeId },
      update: {
        plan: 'FREE',
        monthlyCredits: 0,
        resetDate: endDate,
      },
      create: {
        storeId,
        plan: 'FREE',
        monthlyCredits: 0,
        usedCredits: 0,
        resetDate: endDate,
      },
    });

    return {
      isActive: true,
      daysRemaining: 14,
      startDate: now,
      endDate,
      expired: false,
    };
  }

  /**
   * Get trial status for a store
   */
  getTrialStatus(storeId: string): TrialStatus {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.trialStartDate || !store.trialEndDate) {
      return {
        isActive: false,
        daysRemaining: 0,
        startDate: null,
        endDate: null,
        expired: true,
      };
    }

    const now = new Date();
    const endDate = store.trialEndDate;
    const isExpired = store.trialExpired || now > endDate;

    if (isExpired) {
      // Mark as expired if not already marked
      if (!store.trialExpired) {
        await prisma.store.update({
          where: { id: storeId },
          data: { trialExpired: true },
        });
      }

      return {
        isActive: false,
        daysRemaining: 0,
        startDate: store.trialStartDate,
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
      startDate: store.trialStartDate,
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
    await prisma.store.update({
      where: { id: storeId },
      data: { trialExpired: true },
    });
  }

  /**
   * Upgrade store to paid plan
   */
  async upgradeToPaidPlan(
    storeId: string,
    plan: 'STARTER' | 'PRO'
  ): Promise<void> {
    const credits = this.getMonthlyCreditsForPlan(plan);
    const now = new Date();
    
    // Calculate next reset date (30 days from now)
    const resetDate = new Date(now);
    resetDate.setDate(resetDate.getDate() + 30);

    await prisma.store.update({
      where: { id: storeId },
      data: {
        plan,
        trialExpired: true, // End trial when upgrading
      },
    });

    await prisma.creditAllocation.upsert({
      where: { storeId },
      update: {
        plan,
        monthlyCredits: credits,
        usedCredits: 0, // Reset usage on upgrade
        resetDate,
      },
      create: {
        storeId,
        plan,
        monthlyCredits: credits,
        usedCredits: 0,
        resetDate,
      },
    });
  }
}

// Export singleton instance for convenience
export const creditManager = new CreditManager();
