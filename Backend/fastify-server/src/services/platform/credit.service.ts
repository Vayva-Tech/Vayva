import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class CreditService {
  constructor(private readonly db = prisma) {}

  async getBalance(storeId: string) {
    // Check for store credit allocation
    const allocation = await this.db.storeCreditAllocation.findFirst({
      where: { storeId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!allocation) {
      return {
        monthlyCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        resetDate: null,
        plan: 'STARTER',
      };
    }

    const now = new Date();
    const resetDate = new Date(allocation.resetDate || now);
    const isExpired = now > resetDate;

    // Calculate used credits this period
    const usageQuery = await this.db.creditUsage.aggregate({
      where: {
        storeId,
        createdAt: {
          gte: isExpired ? resetDate : new Date(allocation.periodStart || now),
        },
      },
      _sum: {
        creditsUsed: true,
      },
    });

    const usedCredits = usageQuery._sum.creditsUsed || 0;
    const remainingCredits = Math.max(0, allocation.monthlyAllocation - usedCredits);

    return {
      monthlyCredits: allocation.monthlyAllocation,
      usedCredits,
      remainingCredits,
      resetDate: resetDate.toISOString(),
      plan: allocation.plan || 'STARTER',
    };
  }

  async useCredits(storeId: string, amount: number, feature: string, description?: string) {
    const balance = await this.getBalance(storeId);

    if (balance.remainingCredits < amount) {
      return {
        success: false,
        message: 'Insufficient credits',
        remaining: balance.remainingCredits,
      };
    }

    // Record usage
    await this.db.creditUsage.create({
      data: {
        id: `cu-${Date.now()}`,
        storeId,
        feature,
        creditsUsed: amount,
        description: description || `Used ${amount} credits for ${feature}`,
      },
    });

    const newRemaining = balance.remainingCredits - amount;

    logger.info(`[Credit] Used ${amount} credits for ${feature} in store ${storeId}`);
    
    return {
      success: true,
      remaining: newRemaining,
    };
  }
}
