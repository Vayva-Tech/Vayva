import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { BillingService } from './billing.service';
import { NotificationsService } from '../platform/notifications.service';

export interface TrialMetrics {
  totalTrials: number;
  activeTrials: number;
  expiringToday: number;
  expiringIn3Days: number;
  expiringIn7Days: number;
  convertedLast7Days: number;
  churnedLast7Days: number;
  conversionRate: number;
}

export interface TrialConversionResult {
  success: boolean;
  subscriptionId?: string;
  planKey: string;
  amount: number;
  invoiceId?: string;
  message: string;
}

export class TrialManagementService {
  constructor(
    private readonly db = prisma,
    private readonly billingService = new BillingService(),
    private readonly notificationService = new NotificationsService()
  ) {}

  /**
   * Get trial metrics for a store
   */
  async getTrialMetrics(storeId: string): Promise<TrialMetrics> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalTrials,
      activeTrials,
      expiringToday,
      expiringIn3Days,
      expiringIn7Days,
      convertedLast7Days,
      churnedLast7Days,
    ] = await Promise.all([
      this.db.subscription.count({
        where: {
          storeId,
          status: 'TRIALING',
        },
      }),
      this.db.subscription.count({
        where: {
          storeId,
          status: 'TRIALING',
          currentPeriodEnd: { gt: now },
        },
      }),
      this.db.subscription.count({
        where: {
          storeId,
          status: 'TRIALING',
          currentPeriodEnd: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.db.subscription.count({
        where: {
          storeId,
          status: 'TRIALING',
          currentPeriodEnd: {
            gte: now,
            lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.db.subscription.count({
        where: {
          storeId,
          status: 'TRIALING',
          currentPeriodEnd: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.db.subscriptionChange.count({
        where: {
          storeId,
          changeType: 'CONVERSION',
          changedAt: { gte: sevenDaysAgo },
        },
      }),
      this.db.subscription.count({
        where: {
          storeId,
          status: 'CANCELLED',
          cancelledAt: { gte: sevenDaysAgo },
          cancellationReason: { contains: 'trial_ended' },
        },
      }),
    ]);

    const conversionRate =
      totalTrials > 0 ? (convertedLast7Days / (convertedLast7Days + churnedLast7Days)) * 100 : 0;

    return {
      totalTrials,
      activeTrials,
      expiringToday,
      expiringIn3Days,
      expiringIn7Days,
      convertedLast7Days,
      churnedLast7Days,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Get trials expiring soon with activity scores
   */
  async getExpiringTrials(storeId: string, daysAhead: number = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const expiringTrials = await this.db.subscription.findMany({
      where: {
        storeId,
        status: 'TRIALING',
        currentPeriodEnd: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        store: {
          include: {
            user: true,
          },
        },
        plan: true,
      },
    });

    // Calculate activity scores for each trial
    const trialsWithScores = await Promise.all(
      expiringTrials.map(async (trial) => {
        const [productCount, orderCount, loginCount] = await Promise.all([
          this.db.product.count({
            where: { storeId, createdAt: { gte: trial.startDate } },
          }),
          this.db.order.count({
            where: { storeId, createdAt: { gte: trial.startDate } },
          }),
          this.db.activityLog.count({
            where: {
              storeId,
              timestamp: { gte: trial.startDate },
              action: { contains: 'login' },
            },
          }),
        ]);

        // Calculate activity score (0-100)
        const activityScore = Math.min(100, 
          (productCount * 2) + 
          (orderCount * 5) + 
          (loginCount * 1)
        );

        // Determine conversion likelihood
        let conversionLikelihood: 'high' | 'medium' | 'low' = 'low';
        if (activityScore >= 70) {
          conversionLikelihood = 'high';
        } else if (activityScore >= 40) {
          conversionLikelihood = 'medium';
        }

        const daysLeft = Math.ceil(
          (trial.currentPeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        return {
          subscriptionId: trial.id,
          storeId: trial.storeId,
          storeName: trial.store.name,
          ownerEmail: trial.store.user.email,
          planKey: trial.plan.planKey,
          trialStart: trial.startDate,
          trialEnd: trial.currentPeriodEnd,
          daysLeft,
          activityScore,
          conversionLikelihood,
          productCount,
          orderCount,
          loginCount,
        };
      })
    );

    return trialsWithScores.sort((a, b) => a.daysLeft - b.daysLeft);
  }

  /**
   * Automatically convert trial to paid subscription
   */
  async autoConvertTrial(subscriptionId: string): Promise<TrialConversionResult> {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
      include: {
        store: {
          include: {
            user: true,
          },
        },
        plan: true,
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'TRIALING') {
      return {
        success: false,
        message: `Subscription is not in trial status (current: ${subscription.status})`,
      };
    }

    if (subscription.currentPeriodEnd > new Date()) {
      return {
        success: false,
        message: 'Trial period has not ended yet',
      };
    }

    try {
      // Check if store has payment method on file
      const paymentMethods = await this.db.paymentMethod.findMany({
        where: { storeId: subscription.storeId, isDefault: true },
      });

      if (paymentMethods.length === 0) {
        // No payment method - cancel trial and send notification
        await this.db.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: 'trial_ended_no_payment_method',
          },
        });

        // Send notification to store owner
        await this.notificationService.createNotification({
          userId: subscription.store.userId,
          type: 'billing',
          title: 'Trial Ended - Payment Method Required',
          message: `Your trial for ${subscription.plan.planKey} has ended. Please add a payment method to continue using the platform.`,
          metadata: {
            subscriptionId,
            planKey: subscription.plan.planKey,
          },
        });

        logger.info(`[Trial] Cancelled trial ${subscriptionId} - no payment method`);
        
        return {
          success: false,
          planKey: subscription.plan.planKey,
          amount: 0,
          message: 'Trial cancelled - no payment method on file',
        };
      }

      // Convert trial to paid subscription
      const defaultPlanId = process.env.DEFAULT_PAID_PLAN_ID || 'plan_professional_monthly';
      
      const updatedSubscription = await this.db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          planId: defaultPlanId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialEnd: subscription.currentPeriodEnd,
        },
        include: {
          plan: true,
        },
      });

      // Create invoice for first billing cycle
      const invoice = await this.db.invoiceV2.create({
        data: {
          storeId: subscription.storeId,
          subscriptionId: subscriptionId,
          invoiceNumber: `INV-${Date.now()}`,
          totalKobo: BigInt(updatedSubscription.plan.price * 100),
          subtotalKobo: BigInt(updatedSubscription.plan.price * 100),
          taxKobo: BigInt(0),
          status: 'SENT',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          items: [
            {
              description: `${updatedSubscription.plan.planKey} - Monthly Subscription`,
              quantity: 1,
              unitAmount: updatedSubscription.plan.price * 100,
              amount: updatedSubscription.plan.price * 100,
            },
          ],
        },
      });

      // Track conversion event
      await this.db.subscriptionChange.create({
        data: {
          storeId: subscription.storeId,
          subscriptionId,
          changeType: 'CONVERSION',
          fromPlanId: subscription.planId,
          toPlanId: defaultPlanId,
          changedAt: new Date(),
          metadata: {
            reason: 'auto_conversion',
            trialDays: Math.floor(
              (subscription.currentPeriodEnd.getTime() - subscription.startDate.getTime()) /
                (24 * 60 * 60 * 1000)
            ),
          },
        },
      });

      // Send success notification
      await this.notificationService.createNotification({
        userId: subscription.store.userId,
        type: 'billing',
        title: 'Trial Converted to Paid Plan',
        message: `Congratulations! Your trial has been converted to ${updatedSubscription.plan.planKey}. Invoice ${invoice.invoiceNumber} has been generated.`,
        metadata: {
          subscriptionId,
          planKey: updatedSubscription.plan.planKey,
          invoiceId: invoice.id,
        },
      });

      logger.info(`[Trial] Auto-converted trial ${subscriptionId} to paid plan`);

      return {
        success: true,
        subscriptionId: updatedSubscription.id,
        planKey: updatedSubscription.plan.planKey,
        amount: updatedSubscription.plan.price,
        invoiceId: invoice.id,
        message: 'Trial successfully converted to paid subscription',
      };
    } catch (error) {
      logger.error(`[Trial] Error auto-converting trial ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Manually extend trial period
   */
  async extendTrial(subscriptionId: string, additionalDays: number): Promise<void> {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'TRIALING') {
      throw new Error('Subscription is not in trial status');
    }

    const newEndDate = new Date(
      subscription.currentPeriodEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000
    );

    await this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodEnd: newEndDate,
      },
    });

    logger.info(`[Trial] Extended trial ${subscriptionId} by ${additionalDays} days`);
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(
    subscriptionId: string,
    planId?: string
  ): Promise<{ success: boolean; subscriptionId?: string; message: string }> {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
      };
    }

    if (subscription.status !== 'CANCELLED') {
      return {
        success: false,
        message: `Subscription is not cancelled (current status: ${subscription.status})`,
      };
    }

    try {
      const targetPlanId = planId || subscription.planId;

      const reactivated = await this.db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          planId: targetPlanId,
          cancelledAt: null,
          cancellationReason: null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Track reactivation
      await this.db.subscriptionChange.create({
        data: {
          storeId: subscription.storeId,
          subscriptionId,
          changeType: 'REACTIVATION',
          fromPlanId: subscription.planId,
          toPlanId: targetPlanId,
          changedAt: new Date(),
          metadata: {
            reason: 'manual_reactivation',
          },
        },
      });

      logger.info(`[Subscription] Reactivated subscription ${subscriptionId}`);

      return {
        success: true,
        subscriptionId: reactivated.id,
        message: 'Subscription successfully reactivated',
      };
    } catch (error) {
      logger.error(`[Subscription] Error reactivating subscription ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Send trial expiry reminders
   */
  async sendExpiryReminders(daysBeforeExpiry: number): Promise<number> {
    const now = new Date();
    const targetDate = new Date(now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiringSubscriptions = await this.db.subscription.findMany({
      where: {
        status: 'TRIALING',
        currentPeriodEnd: {
          gte: targetDate,
          lte: tomorrow,
        },
      },
      include: {
        store: {
          include: {
            user: true,
          },
        },
        plan: true,
      },
    });

    let reminderCount = 0;

    for (const sub of expiringSubscriptions) {
      // Check if reminder already sent today
      const existingReminder = await this.db.notification.findFirst({
        where: {
          userId: sub.store.userId,
          type: 'trial_reminder',
          createdAt: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
          },
        },
      });

      if (existingReminder) {
        continue;
      }

      const daysLeft = Math.ceil(
        (sub.currentPeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      await this.notificationService.createNotification({
        userId: sub.store.userId,
        type: 'trial_reminder',
        title: `Trial Expiring in ${daysLeft} Day${daysLeft > 1 ? 's' : ''}`,
        message: `Your ${sub.plan.planKey} trial will expire on ${sub.currentPeriodEnd.toLocaleDateString()}. Add a payment method to avoid interruption.`,
        metadata: {
          subscriptionId: sub.id,
          daysLeft,
          trialEnd: sub.currentPeriodEnd,
        },
      });

      reminderCount++;
    }

    logger.info(`[Trial] Sent ${reminderCount} expiry reminders`);
    return reminderCount;
  }
}
