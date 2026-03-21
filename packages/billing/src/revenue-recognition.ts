/**
 * ASC 606 Revenue Recognition Engine
 * 
 * Implements the 5-step model for revenue recognition:
 * 1. Identify the contract
 * 2. Identify performance obligations
 * 3. Determine transaction price
 * 4. Allocate price to obligations
 * 5. Recognize revenue as obligations satisfied
 */

import { addMonths, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { logger } from '@vayva/shared';
import { prisma } from '@vayva/db';

export interface RevenueRecognitionConfig {
  // ASC 606 compliance settings
  autoRecognizeSubscriptionRevenue: boolean;
  autoRecognizeUsageRevenue: boolean;
  recognitionFrequency: 'daily' | 'monthly';
  
  // Accounting policies
  subscriptionRecognitionMethod: 'ratable' | 'straight_line';
  usageRecognitionTiming: 'invoiced' | 'delivered';
  
  // Reporting
  fiscalYearStart: number; // Month (1-12)
  reportingCurrency: string;
}

export interface PerformanceObligation {
  id: string;
  type: 'subscription' | 'usage' | 'one_time' | 'setup_fee';
  description: string;
  standaloneSellingPrice: number;
  satisfactionMethod: 'over_time' | 'point_in_time';
  satisfactionCriteria?: string;
}

export interface RevenueAllocation {
  obligationId: string;
  allocatedPrice: number;
  recognitionSchedule: RecognitionEntry[];
}

export interface RecognitionEntry {
  period: Date;
  amount: number;
  recognized: boolean;
  recognizedAt?: Date;
}

export interface RevenueReport {
  period: { start: Date; end: Date };
  recognizedRevenue: number;
  deferredRevenue: number;
  unbilledRevenue: number;
  byProduct: Record<string, number>;
  byRegion: Record<string, number>;
  byObligationType: Record<string, number>;
}

export interface Contract {
  id: string;
  merchantId: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  performanceObligations: PerformanceObligation[];
  totalTransactionPrice: number;
}

export class RevenueRecognitionEngine {
  private config: RevenueRecognitionConfig;

  constructor(config: RevenueRecognitionConfig) {
    this.config = config;
  }

  /**
   * Step 1: Identify the contract
   * 
   * A contract exists when:
   * - Parties have approved
   * - Rights are identified
   * - Payment terms are identified
   * - Commercial substance exists
   * - Collection is probable
   */
  async identifyContract(subscriptionId: string): Promise<Contract | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        store: true,
        plan: true,
        invoices: {
          where: { status: 'paid' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!subscription) {
      return null;
    }

    // Check if collection is probable (payment history)
    const hasPaymentHistory = subscription.invoices.length > 0;
    const hasFailedPayments = await prisma.invoice.count({
      where: {
        subscriptionId,
        status: 'failed',
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }) > 2;

    // Collection not probable if too many failed payments
    if (hasFailedPayments && !hasPaymentHistory) {
      logger.warn('[RevenueRecognition] Collection not probable', { subscriptionId });
      return null;
    }

    // Identify performance obligations
    const obligations = await this.identifyPerformanceObligations(subscription);

    return {
      id: subscription.id,
      merchantId: subscription.storeId,
      startDate: subscription.currentPeriodStart,
      endDate: subscription.currentPeriodEnd,
      status: subscription.status === 'active' ? 'active' : 'cancelled',
      performanceObligations: obligations,
      totalTransactionPrice: subscription.plan.price,
    };
  }

  /**
   * Step 2: Identify performance obligations
   * 
   * Distinct obligations if:
   * - Customer can benefit on its own or with readily available resources
   * - Promise to transfer is separately identifiable
   */
  private async identifyPerformanceObligations(subscription: unknown): Promise<PerformanceObligation[]> {
    const obligations: PerformanceObligation[] = [];
    const plan = (subscription as { plan: { name: string; price: number } }).plan;

    // Subscription access is a performance obligation
    obligations.push({
      id: `sub_${(subscription as { id: string }).id}`,
      type: 'subscription',
      description: `${plan.name} Platform Access`,
      standaloneSellingPrice: plan.price * 0.8, // 80% of price allocated to platform
      satisfactionMethod: 'over_time',
      satisfactionCriteria: 'time_elapsed',
    });

    // Support services (if included)
    obligations.push({
      id: `support_${(subscription as { id: string }).id}`,
      type: 'subscription',
      description: 'Customer Support',
      standaloneSellingPrice: plan.price * 0.15, // 15% to support
      satisfactionMethod: 'over_time',
      satisfactionCriteria: 'time_elapsed',
    });

    // AI features (if included in plan)
    const hasAiFeatures = await this.hasAiFeatures((subscription as { id: string }).id);
    if (hasAiFeatures) {
      obligations.push({
        id: `ai_${(subscription as { id: string }).id}`,
        type: 'usage',
        description: 'AI Assistant Usage',
        standaloneSellingPrice: plan.price * 0.05, // 5% to AI
        satisfactionMethod: 'over_time',
        satisfactionCriteria: 'usage_delivered',
      });
    }

    return obligations;
  }

  private async hasAiFeatures(subscriptionId: string): Promise<boolean> {
    const aiSubscription = await prisma.merchantAiSubscription.findUnique({
      where: { subscriptionId },
    });
    return !!aiSubscription;
  }

  /**
   * Step 3: Determine transaction price
   * 
   - Consider variable consideration
   - Constrain estimates
   - Account for time value of money if significant
   - Consider non-cash consideration
   */
  async determineTransactionPrice(contract: Contract): Promise<number> {
    let transactionPrice = contract.totalTransactionPrice;

    // Check for variable consideration (usage overages, etc.)
    const variableConsideration = await this.calculateVariableConsideration(contract);
    transactionPrice += variableConsideration;

    // Apply constraint - only recognize amounts highly probable of not reversing
    const constrainedAmount = await this.applyConstraint(contract, transactionPrice);

    return constrainedAmount;
  }

  private async calculateVariableConsideration(contract: Contract): Promise<number> {
    // Get usage-based charges for the period
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        storeId: contract.merchantId,
        periodStart: { gte: contract.startDate },
        periodEnd: { lte: contract.endDate || new Date() },
      },
    });

    return usageRecords.reduce((sum, record) => sum + (record.overageCharge || 0), 0);
  }

  private async applyConstraint(contract: Contract, amount: number): Promise<number> {
    // Check merchant's payment history
    const failedPayments = await prisma.invoice.count({
      where: {
        subscription: { storeId: contract.merchantId },
        status: 'failed',
        createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
      },
    });

    const totalInvoices = await prisma.invoice.count({
      where: {
        subscription: { storeId: contract.merchantId },
        createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
      },
    });

    // If failure rate > 20%, constrain revenue recognition
    if (totalInvoices > 0 && failedPayments / totalInvoices > 0.2) {
      const constraintFactor = 0.8; // Only recognize 80%
      logger.warn('[RevenueRecognition] Applying constraint due to payment history', {
        contractId: contract.id,
        constraintFactor,
      });
      return amount * constraintFactor;
    }

    return amount;
  }

  /**
   * Step 4: Allocate transaction price
   * 
   * Allocate based on relative standalone selling prices
   */
  allocateTransactionPrice(
    contract: Contract,
    transactionPrice: number
  ): RevenueAllocation[] {
    const totalSSP = contract.performanceObligations.reduce(
      (sum, obs) => sum + obs.standaloneSellingPrice,
      0
    );

    return contract.performanceObligations.map((obligation) => {
      const allocationRatio = obligation.standaloneSellingPrice / totalSSP;
      const allocatedPrice = transactionPrice * allocationRatio;

      return {
        obligationId: obligation.id,
        allocatedPrice,
        recognitionSchedule: this.generateRecognitionSchedule(obligation, allocatedPrice, contract),
      };
    });
  }

  /**
   * Step 5: Recognize revenue
   * 
   * Over time: Recognize as performance obligation is satisfied
   * Point in time: Recognize when control transfers
   */
  private generateRecognitionSchedule(
    obligation: PerformanceObligation,
    allocatedPrice: number,
    contract: Contract
  ): RecognitionEntry[] {
    const schedule: RecognitionEntry[] = [];

    if (obligation.satisfactionMethod === 'over_time') {
      // Ratable recognition over contract period
      const startDate = contract.startDate;
      const endDate = contract.endDate || addMonths(startDate, 1);
      const totalDays = differenceInDays(endDate, startDate);

      if (this.config.subscriptionRecognitionMethod === 'ratable') {
        // Daily recognition
        const dailyAmount = allocatedPrice / totalDays;
        for (let i = 0; i < totalDays; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          schedule.push({
            period: date,
            amount: dailyAmount,
            recognized: false,
          });
        }
      } else {
        // Monthly recognition
        let currentDate = startOfMonth(startDate);
        while (currentDate < endDate) {
          const monthEnd = endOfMonth(currentDate);
          const daysInMonth = Math.min(
            differenceInDays(monthEnd, currentDate) + 1,
            differenceInDays(endDate, currentDate)
          );
          const monthlyAmount = (allocatedPrice / totalDays) * daysInMonth;

          schedule.push({
            period: currentDate,
            amount: monthlyAmount,
            recognized: false,
          });

          currentDate = addMonths(currentDate, 1);
        }
      }
    } else {
      // Point in time recognition
      schedule.push({
        period: contract.startDate,
        amount: allocatedPrice,
        recognized: false,
      });
    }

    return schedule;
  }

  /**
   * Process revenue recognition for a period
   */
  async recognizeRevenueForPeriod(periodStart: Date, periodEnd: Date): Promise<void> {
    logger.info('[RevenueRecognition] Processing revenue recognition', {
      periodStart,
      periodEnd,
    });

    // Get all active contracts
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodStart: { lte: periodEnd },
        currentPeriodEnd: { gte: periodStart },
      },
      include: { store: true, plan: true },
    });

    for (const subscription of subscriptions) {
      try {
        await this.processSubscriptionRevenue(subscription.id, periodStart, periodEnd);
      } catch (error) {
        logger.error('[RevenueRecognition] Failed to process subscription', {
          subscriptionId: subscription.id,
          error,
        });
      }
    }

    logger.info('[RevenueRecognition] Completed revenue recognition', {
      subscriptionsProcessed: subscriptions.length,
    });
  }

  private async processSubscriptionRevenue(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    const contract = await this.identifyContract(subscriptionId);
    if (!contract) return;

    const transactionPrice = await this.determineTransactionPrice(contract);
    const allocations = this.allocateTransactionPrice(contract, transactionPrice);

    // Record revenue recognition entries
    for (const allocation of allocations) {
      const entriesToRecognize = allocation.recognitionSchedule.filter(
        (entry) =>
          entry.period >= periodStart &&
          entry.period <= periodEnd &&
          !entry.recognized
      );

      for (const entry of entriesToRecognize) {
        await prisma.revenueRecognition.create({
          data: {
            subscriptionId,
            obligationId: allocation.obligationId,
            period: entry.period,
            amount: entry.amount,
            recognizedAt: new Date(),
            status: 'recognized',
          },
        });

        entry.recognized = true;
        entry.recognizedAt = new Date();
      }
    }
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(periodStart: Date, periodEnd: Date): Promise<RevenueReport> {
    const recognitions = await prisma.revenueRecognition.findMany({
      where: {
        period: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        subscription: {
          include: { store: true },
        },
      },
    });

    const recognizedRevenue = recognitions
      .filter((r) => r.status === 'recognized')
      .reduce((sum, r) => sum + r.amount, 0);

    const deferredRevenue = recognitions
      .filter((r) => r.status === 'deferred')
      .reduce((sum, r) => sum + r.amount, 0);

    // Calculate unbilled revenue
    const unbilledRevenue = await this.calculateUnbilledRevenue(periodEnd);

    // Breakdown by obligation type
    const byObligationType: Record<string, number> = {};
    for (const recognition of recognitions) {
      const type = recognition.obligationId.split('_')[0];
      byObligationType[type] = (byObligationType[type] || 0) + recognition.amount;
    }

    // Calculate revenue breakdown by product
    const byProduct = await this.getRevenueByProduct(periodStart, periodEnd, recognizedRevenue);
    
    // Calculate revenue breakdown by region
    const byRegion = await this.getRevenueByRegion(periodStart, periodEnd, recognizedRevenue);

    return {
      period: { start: periodStart, end: periodEnd },
      recognizedRevenue,
      deferredRevenue,
      unbilledRevenue,
      byProduct,
      byRegion,
      byObligationType,
    };
  }

  private async getRevenueByProduct(periodStart: Date, periodEnd: Date, totalRevenue: number): Promise<Record<string, number>> {
    // Query subscription revenue grouped by product/plan
    const subscriptions = await prisma.subscription.groupBy({
      by: ['planId'],
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: 'active',
      },
      _sum: {
        amount: true,
      },
    });

    const byProduct: Record<string, number> = {};
    let total = 0;
    
    for (const sub of subscriptions) {
      const plan = sub.planId || 'default';
      const amount = (sub._sum.amount as number) || 0;
      byProduct[plan] = amount;
      total += amount;
    }

    // Normalize to percentages if needed
    if (total > 0 && totalRevenue > 0) {
      const ratio = totalRevenue / total;
      Object.keys(byProduct).forEach(key => {
        byProduct[key] *= ratio;
      });
    }

    return byProduct;
  }

  private async getRevenueByRegion(periodStart: Date, periodEnd: Date, totalRevenue: number): Promise<Record<string, number>> {
    // Query revenue by customer region (based on store location)
    const stores = await prisma.store.groupBy({
      by: ['region'],
      include: {
        subscriptions: {
          where: {
            createdAt: {
              gte: periodStart,
              lte: periodEnd,
            },
            status: 'active',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    const byRegion: Record<string, number> = {};
    let total = 0;
    
    for (const store of stores) {
      const region = store.region || 'unspecified';
      const amount = store.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      byRegion[region] = amount;
      total += amount;
    }

    // Normalize to percentages if needed
    if (total > 0 && totalRevenue > 0) {
      const ratio = totalRevenue / total;
      Object.keys(byRegion).forEach(key => {
        byRegion[key] *= ratio;
      });
    }

    return byRegion;
  }

  private async calculateUnbilledRevenue(asOfDate: Date): Promise<number> {
    // Revenue earned but not yet invoiced
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: { gte: asOfDate },
      },
      include: { invoices: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    let unbilled = 0;
    for (const sub of activeSubscriptions) {
      const lastInvoice = sub.invoices[0];
      if (!lastInvoice || lastInvoice.createdAt < sub.currentPeriodStart) {
        // No invoice for current period - calculate earned revenue
        const daysSincePeriodStart = differenceInDays(asOfDate, sub.currentPeriodStart);
        const totalDays = differenceInDays(sub.currentPeriodEnd, sub.currentPeriodStart);
        const earnedRatio = daysSincePeriodStart / totalDays;
        unbilled += sub.plan.price * earnedRatio;
      }
    }

    return unbilled;
  }

  /**
   * Get deferred revenue balance
   */
  async getDeferredRevenueBalance(subscriptionId: string): Promise<number> {
    const deferred = await prisma.revenueRecognition.findMany({
      where: {
        subscriptionId,
        status: 'deferred',
      },
    });

    return deferred.reduce((sum, d) => sum + d.amount, 0);
  }

  /**
   * Handle contract modification
   */
  async handleContractModification(
    subscriptionId: string,
    modificationType: 'upgrade' | 'downgrade' | 'cancellation'
  ): Promise<void> {
    logger.info('[RevenueRecognition] Handling contract modification', {
      subscriptionId,
      modificationType,
    });

    if (modificationType === 'cancellation') {
      // Recognize all remaining deferred revenue
      await prisma.revenueRecognition.updateMany({
        where: {
          subscriptionId,
          status: 'deferred',
        },
        data: {
          status: 'recognized',
          recognizedAt: new Date(),
        },
      });
    } else {
      // Prospective treatment for upgrades/downgrades
      // Recalculate remaining recognition schedule
      await this.recalculateRecognitionSchedule(subscriptionId);
    }
  }

  private async recalculateRecognitionSchedule(subscriptionId: string): Promise<void> {
    // Mark future entries as pending recalculation
    await prisma.revenueRecognition.updateMany({
      where: {
        subscriptionId,
        status: 'deferred',
        period: { gte: new Date() },
      },
      data: {
        status: 'pending_recalculation',
      },
    });

    // Re-run recognition for this subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (subscription) {
      await this.processSubscriptionRevenue(
        subscriptionId,
        new Date(),
        subscription.currentPeriodEnd
      );
    }
  }
}

// Default configuration
export const defaultConfig: RevenueRecognitionConfig = {
  autoRecognizeSubscriptionRevenue: true,
  autoRecognizeUsageRevenue: true,
  recognitionFrequency: 'daily',
  subscriptionRecognitionMethod: 'ratable',
  usageRecognitionTiming: 'delivered',
  fiscalYearStart: 1,
  reportingCurrency: 'NGN',
};

// Singleton instance
let engine: RevenueRecognitionEngine | null = null;

export function initializeRevenueRecognition(config?: Partial<RevenueRecognitionConfig>): RevenueRecognitionEngine {
  engine = new RevenueRecognitionEngine({ ...defaultConfig, ...config });
  return engine;
}

export function getRevenueRecognitionEngine(): RevenueRecognitionEngine {
  if (!engine) {
    engine = new RevenueRecognitionEngine(defaultConfig);
  }
  return engine;
}
