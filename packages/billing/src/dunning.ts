/**
 * Dunning Management Service
 * 
 * Handles failed payment recovery:
 * - Retry schedule management
 * - WhatsApp notifications
 * - Payment retry attempts
 * - Account suspension
 */

import { prisma, SubscriptionStatus, DunningAttemptStatus } from '@vayva/db';
import { logger } from '@vayva/shared';
import { DUNNING_SCHEDULE } from './types';
import type { Queue } from 'bullmq';

export interface DunningContext {
  whatsappQueue: Queue;
  appUrl: string;
}

export class DunningManager {
  private static readonly SCHEDULE = DUNNING_SCHEDULE;

  /**
   * Handle a failed payment
   */
  static async handleFailedPayment(
    subscriptionId: string,
    context: DunningContext
  ): Promise<void> {
    const { whatsappQueue, appUrl } = context;

    try {
      // Get subscription with store and owner details
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          store: {
            include: {
              memberships: {
                where: { role_enum: 'OWNER' },
                include: { user: true },
              },
            },
          },
        },
      });

      if (!subscription) {
        logger.error('[Dunning] Subscription not found', { subscriptionId });
        return;
      }

      const storeId = subscription.storeId;
      const owner = subscription.store.memberships?.[0]?.user;

      if (!owner?.phone) {
        logger.warn('[Dunning] No owner phone found for store', { storeId });
        return;
      }

      // Get or create dunning attempt
      let attempt = await prisma.dunningAttempt.findFirst({
        where: {
          subscriptionId,
          status: { in: ['PENDING', 'NOTIFIED', 'RETRY_SCHEDULED'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!attempt) {
        // First failure - create new attempt
        attempt = await prisma.dunningAttempt.create({
          data: {
            storeId,
            subscriptionId,
            attemptNumber: 1,
            status: 'PENDING',
            amountDue: BigInt(0), // Will be set from subscription
            nextAttemptAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          },
        });
      }

      // Execute dunning action based on schedule
      await this.executeDunningAction(attempt.attemptNumber, {
        storeId,
        subscriptionId,
        ownerPhone: owner.phone,
        ownerName: owner.firstName || 'there',
        amount: Number(attempt.amountDue || 0) / 100, // Convert kobo to naira
        appUrl,
        whatsappQueue,
      });

      logger.info('[Dunning] Processed failed payment', {
        subscriptionId,
        storeId,
        attemptNumber: attempt.attemptNumber,
      });
    } catch (error) {
      logger.error('[Dunning] Failed to handle failed payment', {
        error,
        subscriptionId,
      });
      throw error;
    }
  }

  /**
   * Execute dunning action based on attempt number
   */
  private static async executeDunningAction(
    attemptNumber: number,
    params: {
      storeId: string;
      subscriptionId: string;
      ownerPhone: string;
      ownerName: string;
      amount: number;
      appUrl: string;
      whatsappQueue: Queue;
    }
  ): Promise<void> {
    const { storeId, subscriptionId, ownerPhone, ownerName, amount, appUrl, whatsappQueue } = params;

    // Get schedule entry (0-indexed)
    const scheduleEntry = this.SCHEDULE[Math.min(attemptNumber - 1, this.SCHEDULE.length - 1)];

    if (!scheduleEntry) {
      logger.warn('[Dunning] No schedule entry for attempt', { attemptNumber });
      return;
    }

    const billingUrl = `${appUrl}/dashboard/billing`;

    switch (scheduleEntry.action) {
      case 'notify':
        await this.sendNotification(whatsappQueue, ownerPhone, {
          type: 'payment_failed',
          ownerName,
          amount,
          billingUrl,
        });
        await this.updateAttemptStatus(subscriptionId, 'NOTIFIED');
        break;

      case 'retry':
        await this.sendNotification(whatsappQueue, ownerPhone, {
          type: 'payment_retry',
          ownerName,
          amount,
          billingUrl,
          attemptNumber,
        });
        
        // Implement payment retry via Paystack
        try {
          const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { 
              box: { include: { store: true } },
              paymentMethod: true,
            },
          });

          if (subscription?.paymentMethod?.paystackAuthorizationCode) {
            // Charge customer using saved authorization code
            const retryResponse = await fetch('https://api.paystack.co/transaction/charge_authorization', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: subscription.box?.store?.owner?.email,
                amount: Math.round(parseFloat(amount.toString()) * 100), // Convert to kobo
                authorization_code: subscription.paymentMethod.paystackAuthorizationCode,
                reference: `DUNNING_${subscriptionId}_${Date.now()}`,
              }),
            });

            const result = await retryResponse.json();
            
            if (result.status && result.data.status === 'success') {
              // Payment successful - update subscription status
              await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                  status: 'ACTIVE',
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
              });

              // Record successful payment
              await prisma.payment.create({
                data: {
                  subscriptionId,
                  amount: parseFloat(amount.toString()),
                  currency: 'NGN',
                  status: 'SUCCESS',
                  paystackReference: result.data.reference,
                  paidAt: new Date(),
                },
              });

              console.log(`[DUNNING] Payment retry successful for subscription ${subscriptionId}`);
            }
          }
        } catch (error) {
          console.error('[DUNNING] Payment retry failed:', error);
          // Will continue with notification workflow even if payment fails
        }
        
        await this.updateAttemptStatus(subscriptionId, 'RETRY_SCHEDULED');
        break;

      case 'final_notice':
        await this.sendNotification(whatsappQueue, ownerPhone, {
          type: 'final_notice',
          ownerName,
          amount,
          billingUrl,
        });
        await this.updateAttemptStatus(subscriptionId, 'RETRY_SCHEDULED');
        break;

      case 'suspend':
        await this.suspendSubscription(storeId, subscriptionId);
        await this.sendNotification(whatsappQueue, ownerPhone, {
          type: 'account_suspended',
          ownerName,
          billingUrl,
        });
        await this.updateAttemptStatus(subscriptionId, 'SUSPENDED');
        break;
    }
  }

  /**
   * Send WhatsApp notification
   */
  private static async sendNotification(
    whatsappQueue: Queue,
    phone: string,
    params: {
      type: 'payment_failed' | 'payment_retry' | 'final_notice' | 'account_suspended';
      ownerName: string;
      amount?: number;
      billingUrl: string;
      attemptNumber?: number;
    }
  ): Promise<void> {
    const { type, ownerName, amount, billingUrl, attemptNumber } = params;

    const messages: Record<string, string> = {
      payment_failed: `Hi ${ownerName}. Your Vayva subscription payment${amount ? ` of ₦${amount.toLocaleString()}` : ''} failed. Please update your payment method to avoid service interruption.\n\n${billingUrl}`,
      
      payment_retry: `Hi ${ownerName}. We tried to process your subscription payment${attemptNumber ? ` (attempt ${attemptNumber})` : ''} but it failed again. Please update your card to avoid service interruption.\n\n${billingUrl}`,
      
      final_notice: `URGENT: ${ownerName}, your Vayva account will be suspended in 7 days due to non-payment. Please update your payment method immediately to keep your store running.\n\n${billingUrl}`,
      
      account_suspended: `Hi ${ownerName}. Your Vayva account has been suspended due to non-payment. Update your payment method to restore service immediately.\n\n${billingUrl}`,
    };

    const message = messages[type];

    await whatsappQueue.add('send', {
      to: phone,
      body: message,
    });

    logger.info('[Dunning] Sent WhatsApp notification', {
      type,
      phone: phone.slice(-4), // Log only last 4 digits
    });
  }

  /**
   * Update dunning attempt status
   */
  private static async updateAttemptStatus(
    subscriptionId: string,
    status: DunningAttemptStatus
  ): Promise<void> {
    await prisma.dunningAttempt.updateMany({
      where: {
        subscriptionId,
        status: { not: status },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Suspend subscription and store
   */
  private static async suspendSubscription(
    storeId: string,
    subscriptionId: string
  ): Promise<void> {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.PAST_DUE,
          updatedAt: new Date(),
        },
      }),
      prisma.store.update({
        where: { id: storeId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      }),
    ]);

    logger.warn('[Dunning] Store suspended due to non-payment', {
      storeId,
      subscriptionId,
    });
  }

  /**
   * Process scheduled dunning retries
   * Called by worker on schedule
   */
  static async processScheduledRetries(context: DunningContext): Promise<void> {
    const now = new Date();

    const pendingRetries = await prisma.dunningAttempt.findMany({
      where: {
        status: { in: ['PENDING', 'RETRY_SCHEDULED'] },
        nextAttemptAt: { lte: now },
      },
      include: {
        store: {
          include: {
            memberships: {
              where: { role_enum: 'OWNER' },
              include: { user: true },
            },
          },
        },
      },
    });

    logger.info(`[Dunning] Processing ${pendingRetries.length} scheduled retries`);

    for (const attempt of pendingRetries) {
      try {
        // Increment attempt number
        const nextAttemptNumber = attempt.attemptNumber + 1;

        await prisma.dunningAttempt.update({
          where: { id: attempt.id },
          data: {
            attemptNumber: nextAttemptNumber,
            nextAttemptAt: this.calculateNextAttemptTime(nextAttemptNumber),
          },
        });

        // Execute next action
        await this.executeDunningAction(nextAttemptNumber, {
          storeId: attempt.storeId,
          subscriptionId: attempt.subscriptionId,
          ownerPhone: attempt.store.memberships?.[0]?.user?.phone || '',
          ownerName: attempt.store.memberships?.[0]?.user?.firstName || 'there',
          amount: Number(attempt.amountDue || 0) / 100,
          appUrl: context.appUrl,
          whatsappQueue: context.whatsappQueue,
        });
      } catch (error) {
        logger.error('[Dunning] Failed to process scheduled retry', {
          error,
          attemptId: attempt.id,
        });
      }
    }
  }

  /**
   * Calculate next attempt time based on schedule
   */
  private static calculateNextAttemptTime(attemptNumber: number): Date {
    const scheduleEntry = this.SCHEDULE[Math.min(attemptNumber - 1, this.SCHEDULE.length - 1)];
    const days = scheduleEntry?.days || 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Mark payment as successful - resolve dunning
   */
  static async resolveDunning(subscriptionId: string): Promise<void> {
    await prisma.dunningAttempt.updateMany({
      where: {
        subscriptionId,
        status: { not: 'SUCCESS' },
      },
      data: {
        status: 'SUCCESS',
        updatedAt: new Date(),
      },
    });

    logger.info('[Dunning] Resolved dunning for subscription', { subscriptionId });
  }
}
