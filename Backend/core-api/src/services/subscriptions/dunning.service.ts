import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Dunning Service - Backend
 * Manages failed payment recovery for subscription boxes
 */
export class DunningService {
  constructor(private readonly db = prisma) {}

  /**
   * Initialize dunning process for a failed payment
   */
  async initiateDunning(subscriptionId: string, amount: number, error?: string) {
    const subscription = await this.db.boxSubscription.findUnique({
      where: { id: subscriptionId },
      include: { box: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get dunning config for this box
    const config = await this.getDunningConfig(subscription.storeId, subscription.boxId);

    // Create dunning attempt
    const attempt = await this.db.dunningAttempt.create({
      data: {
        id: `dunning-${Date.now()}`,
        subscriptionId,
        attemptNumber: 1,
        status: 'pending',
        amount,
        error: error || null,
        scheduledAt: new Date(),
        retrySchedule: config.retrySchedule,
      },
    });

    // Update subscription status
    await this.db.boxSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'payment_failed',
        lastPaymentAttempt: new Date(),
        paymentFailureReason: error,
      },
    });

    logger.info(`[Dunning] Initiated for subscription ${subscriptionId}, amount: ${amount}`);

    return { attempt, config };
  }

  /**
   * Process a dunning retry
   */
  async processRetry(attemptId: string) {
    const attempt = await this.db.dunningAttempt.findUnique({
      where: { id: attemptId },
      include: { subscription: true },
    });

    if (!attempt || attempt.status !== 'pending') {
      throw new Error('Invalid or already processed attempt');
    }

    // Update status to processing
    await this.db.dunningAttempt.update({
      where: { id: attemptId },
      data: { status: 'processing' },
    });

    try {
      // Attempt to charge customer again
      const result = await this.retryPayment(attempt.subscription, attempt.amount);

      if (result.success) {
        await this.markAttemptAsSuccess(attemptId, attempt.subscriptionId);
        return { success: true, attemptId };
      } else {
        await this.markAttemptAsFailed(attemptId, result.error);
        await this.scheduleNextRetry(attempt, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.markAttemptAsFailed(attemptId, errorMessage);
      await this.scheduleNextRetry(attempt, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Retry payment
   */
  private async retryPayment(subscription: any, amount: number) {
    // This would integrate with payment gateway (Paystack/Stripe)
    // Simplified implementation
    logger.info(`[Dunning] Retrying payment for subscription ${subscription.id}, amount: ${amount}`);
    
    // Simulate payment attempt
    // In production, call payment gateway API
    return {
      success: false,
      error: 'Payment gateway not configured',
    };
  }

  /**
   * Mark attempt as successful
   */
  private async markAttemptAsSuccess(attemptId: string, subscriptionId: string) {
    await this.db.dunningAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'success',
        processedAt: new Date(),
      },
    });

    // Update subscription
    await this.db.boxSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        lastPaymentAttempt: new Date(),
        paymentFailureReason: null,
      },
    });

    logger.info(`[Dunning] Payment recovered for subscription ${subscriptionId}`);
  }

  /**
   * Mark attempt as failed
   */
  private async markAttemptAsFailed(attemptId: string, error: string) {
    await this.db.dunningAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'failed',
        error,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Schedule next retry based on config
   */
  private async scheduleNextRetry(attempt: any, error: string) {
    const config = await this.getDunningConfig(
      attempt.subscription.storeId,
      attempt.subscription.boxId
    );

    const nextAttemptNum = attempt.attemptNumber + 1;

    // Check if max retries reached
    if (nextAttemptNum > config.maxRetries) {
      await this.exhaustDunning(attempt.subscriptionId, config.finalAction);
      return;
    }

    // Calculate next retry date
    const retryDay = config.retrySchedule[nextAttemptNum - 1] || 7;
    const nextRetryDate = new Date();
    nextRetryDate.setDate(nextRetryDate.getDate() + retryDay);

    // Create next attempt
    await this.db.dunningAttempt.create({
      data: {
        id: `dunning-${Date.now()}-${nextAttemptNum}`,
        subscriptionId: attempt.subscriptionId,
        attemptNumber: nextAttemptNum,
        status: 'pending',
        amount: attempt.amount,
        error,
        scheduledAt: nextRetryDate,
        retrySchedule: config.retrySchedule,
      },
    });

    logger.info(
      `[Dunning] Scheduled retry #${nextAttemptNum} for ${nextRetryDate.toISOString()}`
    );
  }

  /**
   * Exhaust dunning process (max retries reached)
   */
  private async exhaustDunning(subscriptionId: string, finalAction: string) {
    await this.db.dunningAttempt.update({
      where: { subscriptionId },
      data: {
        status: 'exhausted',
      },
    });

    // Apply final action
    switch (finalAction) {
      case 'cancel':
        await this.db.boxSubscription.update({
          where: { id: subscriptionId },
          data: { status: 'cancelled' },
        });
        logger.warn(`[Dunning] Subscription ${subscriptionId} cancelled`);
        break;

      case 'pause':
        await this.db.boxSubscription.update({
          where: { id: subscriptionId },
          data: { status: 'paused' },
        });
        logger.warn(`[Dunning] Subscription ${subscriptionId} paused`);
        break;

      case 'notify_only':
      default:
        logger.warn(`[Dunning] Max retries reached for ${subscriptionId}, notifying owner`);
        break;
    }
  }

  /**
   * Get dunning configuration for store/box
   */
  async getDunningConfig(storeId: string, boxId?: string) {
    let config = await this.db.dunningConfig.findFirst({
      where: { storeId, boxId: boxId || null },
    });

    // If no config found and boxId provided, try store-level default
    if (!config && boxId) {
      config = await this.db.dunningConfig.findFirst({
        where: { storeId, boxId: null },
      });
    }

    // Return default config if still not found
    return (
      config || {
        storeId,
        boxId: null,
        retrySchedule: [1, 3, 7, 14],
        maxRetries: 4,
        finalAction: 'pause',
        notifyCustomer: true,
        notifyOwner: true,
      }
    );
  }

  /**
   * Update dunning configuration
   */
  async updateDunningConfig(configData: any) {
    const { storeId, boxId, ...updates } = configData;

    const existing = await this.db.dunningConfig.findFirst({
      where: { storeId, boxId: boxId || null },
    });

    if (existing) {
      return await this.db.dunningConfig.update({
        where: { id: existing.id },
        data: updates,
      });
    }

    return await this.db.dunningConfig.create({
      data: {
        id: `dunning-config-${Date.now()}`,
        storeId,
        boxId: boxId || null,
        ...updates,
      },
    });
  }

  /**
   * Get pending dunning attempts
   */
  async getPendingAttempts(storeId?: string, limit = 50) {
    const where: any = {
      status: 'pending',
      scheduledAt: { lte: new Date() },
    };

    if (storeId) {
      const subscriptions = await this.db.boxSubscription.findMany({
        where: { storeId },
        select: { id: true },
      });
      where.subscriptionId = { in: subscriptions.map((s) => s.id) };
    }

    return await this.db.dunningAttempt.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: { subscription: true },
    });
  }
}
