/**
 * Trial Nurture Worker
 * 
 * Sends automated email sequences to merchants during their trial period.
 * Runs daily at 10:00 AM to send emails based on days remaining.
 * 
 * Schedule: 0 10 * * * (Daily at 10 AM)
 */

import { prisma, AiSubscriptionStatus } from "@vayva/db";
import { logger } from "@vayva/shared";
import { sendTrialNurtureEmail } from "@vayva/emails/campaign-utils";
import { captureException, addBreadcrumb, withErrorTracking } from "@/lib/sentry";

interface TrialMerchant {
  id: string;
  storeId: string;
  status: AiSubscriptionStatus;
  trialExpiresAt: Date;
  graceEndsAt?: Date | null;
  store: {
    name: string;
    memberships: Array<{
      user: {
        email: string;
        firstName?: string | null;
      };
    }>;
  };
}

/**
 * Calculate days until trial expiry
 */
function calculateDaysRemaining(trialExpiresAt: Date): number {
  const now = new Date();
  const diffMs = trialExpiresAt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Process trial nurture emails for all active trials
 */
export async function processTrialNurtureCampaign(): Promise<void> {
  return withErrorTracking(
    async () => {
      const now = new Date();

      addBreadcrumb("Fetching active trials", { timestamp: now.toISOString() });

      // Find all active trials
      const activeTrials = await prisma.merchantAiSubscription.findMany({
        where: {
          status: AiSubscriptionStatus.TRIAL_ACTIVE,
          trialExpiresAt: {
            gte: now, // Not yet expired
          },
        },
        include: {
          store: {
            include: {
              memberships: {
                where: { role_enum: "OWNER" },
                include: { user: true },
              },
            },
          },
        },
      });

      logger.info(`[TRIAL_NURTURE] Found ${activeTrials.length} active trials to process`, {
        app: "worker",
      });

      for (const merchant of activeTrials) {
        try {
          const daysRemaining = calculateDaysRemaining(merchant.trialExpiresAt);

          addBreadcrumb(`Processing trial merchant`, {
            merchantId: merchant.id,
            storeId: merchant.storeId,
            daysRemaining,
          });

          // Determine which email to send based on days remaining
          let templateName: string | null = null;

          if (daysRemaining === 7) {
            templateName = "trial-day-7";
          } else if (daysRemaining === 3) {
            templateName = "trial-day-3";
          } else if (daysRemaining === 1) {
            templateName = "trial-day-1";
          }

          // Only send if we have a matching template
          if (templateName) {
            const owner = merchant.store.memberships[0];
            if (!owner) {
              logger.warn("[TRIAL_NURTURE] No owner found for merchant", {
                merchantId: merchant.id,
                storeId: merchant.storeId,
              });
              continue;
            }

            await sendTrialNurtureEmail(
              owner.user.email,
              merchant.store.name,
              owner.user.firstName || "there",
              daysRemaining
            );
          }
        } catch (error: unknown) {
          captureException(error, {
            merchantId: merchant.id,
            storeId: merchant.storeId,
            operation: "process_trial_merchant",
          });
          
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("[TRIAL_NURTURE] Failed to process merchant", {
            error: err.message,
            merchantId: merchant.id,
            storeId: merchant.storeId,
          });
          // Continue processing other merchants
        }
      }

      // Also process expired trials in grace period
      await processExpiredTrials();
    },
    {
      operationName: "trial_nurture_campaign",
      workerType: "trial-nurture",
    }
  );
}

/**
 * Process expired trials and send expiry notification
 */
async function processExpiredTrials(): Promise<void> {
  const now = new Date();

  // Find trials that just expired (within last 24 hours)
  const recentlyExpired = await prisma.merchantAiSubscription.findMany({
    where: {
      status: AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
      graceEndsAt: {
        gte: now, // Still in grace period
      },
      updatedAt: {
        gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Updated in last 24h
      },
    },
    include: {
      store: {
        include: {
          memberships: {
            where: { role_enum: "OWNER" },
            include: { user: true },
          },
        },
      },
    },
  });

  logger.info(`[TRIAL_NURTURE] Found ${recentlyExpired.length} recently expired trials`, {
    app: "worker",
  });

  for (const merchant of recentlyExpired) {
    try {
      const daysInGrace = merchant.graceEndsAt
        ? calculateDaysRemaining(merchant.graceEndsAt)
        : 3;

      const owner = merchant.store.memberships[0];
      if (!owner) {
        logger.warn("[TRIAL_NURTURE] No owner found for expired merchant", {
          merchantId: merchant.id,
          storeId: merchant.storeId,
        });
        continue;
      }

      await sendTrialNurtureEmail(
        owner.user.email,
        merchant.store.name,
        owner.user.firstName || "there",
        0 // 0 days remaining = expired
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("[TRIAL_NURTURE] Failed to process expired trial", {
        error: err.message,
        merchantId: merchant.id,
        storeId: merchant.storeId,
      });
    }
  }
}

/**
 * Main worker function
 */
export async function runTrialNurtureWorker(): Promise<void> {
  return withErrorTracking(
    async () => {
      logger.info("[TRIAL_NURTURE] Starting trial nurture campaign", {
        app: "worker",
      });

      await processTrialNurtureCampaign();

      logger.info("[TRIAL_NURTURE] Trial nurture campaign completed", {
        app: "worker",
      });
    },
    {
      operationName: "run_trial_nurture_worker",
      workerType: "trial-nurture",
    }
  );
}

// Export for cron job scheduling
export default runTrialNurtureWorker;
