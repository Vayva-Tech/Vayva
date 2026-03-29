/**
 * Trial Conversion Worker
 * 
 * Automatically processes trial expirations and conversions:
 * - Checks for trials ending daily
 * - Sends reminder notifications (3 days, 1 day, day of)
 * - Auto-converts trials with payment methods
 * - Cancels trials without payment methods
 * - Tracks conversion metrics
 */

import { prisma } from '@vayva/db';
import { logger } from '../lib/logger';
import { TrialManagementService } from './services/subscriptions/trial-management.service';

const trialManagement = new TrialManagementService();

interface WorkerMetrics {
  processedAt: Date;
  trialsChecked: number;
  remindersSent: number;
  conversionsAttempted: number;
  successfulConversions: number;
  failedConversions: number;
  cancellations: number;
}

/**
 * Main worker function - runs every hour
 */
export async function processTrialConversions(): Promise<WorkerMetrics> {
  const metrics: WorkerMetrics = {
    processedAt: new Date(),
    trialsChecked: 0,
    remindersSent: 0,
    conversionsAttempted: 0,
    successfulConversions: 0,
    failedConversions: 0,
    cancellations: 0,
  };

  try {
    logger.info('[TrialWorker] Starting trial conversion processing');

    // Get all active trials
    const trials = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        currentPeriodEnd: {
          gte: new Date(),
        },
      },
      include: {
        store: true,
        plan: true,
      },
    });

    metrics.trialsChecked = trials.length;
    logger.info(`[TrialWorker] Found ${trials.length} active trials`);

    const now = new Date();

    for (const trial of trials) {
      const hoursUntilExpiry =
        (trial.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Send reminders based on timing
      if (Math.round(hoursUntilExpiry) === 72) {
        // 3 days before
        await trialManagement.sendExpiryReminders(3);
        metrics.remindersSent++;
      } else if (Math.round(hoursUntilExpiry) === 24) {
        // 1 day before
        await trialManagement.sendExpiryReminders(1);
        metrics.remindersSent++;
      } else if (Math.round(hoursUntilExpiry) === 0) {
        // Day of expiry
        await trialManagement.sendExpiryReminders(0);
        metrics.remindersSent++;
      }

      // Process trials that have expired
      if (trial.currentPeriodEnd <= now) {
        metrics.conversionsAttempted++;

        try {
          const result = await trialManagement.autoConvertTrial(trial.id);

          if (result.success) {
            metrics.successfulConversions++;
            logger.info(`[TrialWorker] Successfully converted trial ${trial.id}`);
          } else {
            metrics.failedConversions++;
            
            // If conversion failed due to no payment method, count as cancellation
            if (result.message.includes('no_payment_method')) {
              metrics.cancellations++;
            }
            
            logger.warn(`[TrialWorker] Failed to convert trial ${trial.id}: ${result.message}`);
          }
        } catch (error) {
          metrics.failedConversions++;
          logger.error(`[TrialWorker] Error converting trial ${trial.id}`, error);
        }
      }
    }

    // Calculate and store daily metrics
    await storeDailyMetrics(metrics);

    logger.info(
      `[TrialWorker] Processing complete. ` +
        `Checked: ${metrics.trialsChecked}, ` +
        `Reminders: ${metrics.remindersSent}, ` +
        `Conversions: ${metrics.successfulConversions}/${metrics.conversionsAttempted}`
    );

    return metrics;
  } catch (error) {
    logger.error('[TrialWorker] Critical error during processing', error);
    throw error;
  }
}

/**
 * Store daily conversion metrics for analytics
 */
async function storeDailyMetrics(metrics: WorkerMetrics): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.businessMetric.upsert({
      where: {
        date: today,
      },
      update: {
        trialToPaidConversions: {
          increment: metrics.successfulConversions,
        },
      },
      create: {
        date: today,
        mrr: 0,
        arr: 0,
        activeSubscriptions: 0,
        newTrials: 0,
        trialToPaidConversions: metrics.successfulConversions,
        trialConversionRate: 0,
        churnedSubscriptions: metrics.cancellations,
        churnRate: 0,
        netRevenueRetention: 100,
        averageRevenuePerUser: 0,
        planDistribution: {},
        failedPayments: 0,
        gracePeriodEntries: 0,
      },
    });

    logger.info(`[TrialWorker] Stored daily metrics: ${metrics.successfulConversions} conversions`);
  } catch (error) {
    logger.error('[TrialWorker] Error storing metrics', error);
  }
}

/**
 * Manual trigger for testing/admin use
 */
export async function manuallyProcessTrial(subscriptionId: string): Promise<void> {
  try {
    const result = await trialManagement.autoConvertTrial(subscriptionId);
    logger.info(`[TrialWorker] Manual conversion result:`, result);
  } catch (error) {
    logger.error(`[TrialWorker] Manual conversion error for ${subscriptionId}`, error);
    throw error;
  }
}

// Export for use in worker scheduler
if (process.env.WORKER_MODE === 'trial') {
  logger.info('[TrialWorker] Starting in standalone mode');
  
  // Run immediately if in standalone mode
  processTrialConversions().catch((error) => {
    logger.error('[TrialWorker] Fatal error', error);
    process.exit(1);
  });
}
