/**
 * Win-Back Campaign Worker
 * 
 * Sends automated reactivation emails to merchants with expired trials.
 * Runs weekly on Mondays at 2:00 PM to send win-back sequences.
 * 
 * Schedule: 0 14 * * 1 (Every Monday at 2 PM)
 * 
 * Sequence:
 * - Day +3:  WinbackDay3 (20% discount offer)
 * - Day +7:  WinbackDay7 (Value reminder)
 * - Day +14: WinbackDay14 (Final special pricing - 50% off)
 * - Day +30: WinbackDay30 (Fresh start invitation)
 */

import { prisma, AiSubscriptionStatus } from "@vayva/db";
import { logger } from "@vayva/shared";
import { sendWinBackEmail } from "@vayva/emails/campaign-utils";
import { captureException, addBreadcrumb, withErrorTracking } from "@/lib/sentry";

interface ExpiredMerchant {
  id: string;
  storeId: string;
  status: AiSubscriptionStatus;
  trialExpiresAt: Date;
  graceEndsAt?: Date | null;
  closedAt?: Date | null;
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
 * Calculate days since trial expiry
 */
function calculateDaysSinceExpiry(trialExpiresAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - trialExpiresAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Send win-back email based on days since expiry
 */
async function sendWinbackEmail(
  merchant: ExpiredMerchant,
  daysSinceExpiry: number,
  templateName: string
): Promise<void> {
  try {
    const owner = merchant.store.memberships[0];
    if (!owner) {
      logger.warn("[WINBACK] No owner found for merchant", {
        merchantId: merchant.id,
        storeId: merchant.storeId,
      });
      return;
    }

    // Use shared campaign utility
    await sendWinBackEmail(
      owner.user.email,
      merchant.store.name,
      owner.user.firstName || "there",
      daysSinceExpiry
    );

    logger.info("[WINBACK] Email queued successfully", {
      merchantId: merchant.id,
      storeId: merchant.storeId,
      email: owner.user.email,
      template: templateName,
      daysSinceExpiry,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[WINBACK] Failed to send email", {
      error: err.message,
      merchantId: merchant.id,
      storeId: merchant.storeId,
      template: templateName,
    });
  }
}

/**
 * Get email subject based on template
 */
function getSubjectForWinback(templateName: string, daysSinceExpiry: number): string {
  switch (templateName) {
    case "winback-day-3":
      return `We miss you! Here's 20% off to come back 💚`;
    case "winback-day-7":
      return `Your customers are waiting - Don't miss these opportunities 🛍️`;
    case "winback-day-14":
      return `Final chance for special pricing ⏳`;
    case "winback-day-30":
      return `Ready to restart? Your account is waiting 🌟`;
    default:
      return "Come back to Vayva!";
  }
}

/**
 * Render appropriate email template
 */
function renderWinbackTemplate(templateName: string, data: any) {
  switch (templateName) {
    case "winback-day-3":
      return WinbackDay3(data);
    case "winback-day-7":
      return WinbackDay7(data);
    case "winback-day-14":
      return WinbackDay14(data);
    case "winback-day-30":
      return WinbackDay30(data);
    default:
      return WinbackDay3(data);
  }
}

/**
 * Check if merchant already received this specific winback email
 */
async function hasReceivedEmail(
  merchantId: string,
  templateName: string,
  daysSinceExpiry: number
): Promise<boolean> {
  // In production, this would check an email_sent log table
  // For now, we'll assume no duplicate sends within the same day window
  return false;
}

/**
 * Process win-back campaign for all expired merchants
 */
export async function processWinbackCampaign(): Promise<void> {
  return withErrorTracking(
    async () => {
      const now = new Date();

      addBreadcrumb("Fetching expired merchants", { timestamp: now.toISOString() });

      // Find all expired/closed subscriptions
      const expiredMerchants = await prisma.merchantAiSubscription.findMany({
        where: {
          status: {
            in: [
              AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
              AiSubscriptionStatus.SOFT_CLOSED,
            ],
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

      logger.info(`[WINBACK] Found ${expiredMerchants.length} expired merchants to process`, {
        app: "worker",
      });

      for (const merchant of expiredMerchants) {
        try {
          const daysSinceExpiry = calculateDaysSinceExpiry(merchant.trialExpiresAt);

          addBreadcrumb(`Processing winback merchant`, {
            merchantId: merchant.id,
            storeId: merchant.storeId,
            daysSinceExpiry,
          });

          // Determine which email to send based on days since expiry
          let templateName: string | null = null;

          // Day +3: 20% discount offer
          if (daysSinceExpiry >= 3 && daysSinceExpiry < 4) {
            const alreadySent = await hasReceivedEmail(merchant.id, "winback-day-3", daysSinceExpiry);
            if (!alreadySent) {
              templateName = "winback-day-3";
            }
          }
          // Day +7: Value reminder
          else if (daysSinceExpiry >= 7 && daysSinceExpiry < 8) {
            const alreadySent = await hasReceivedEmail(merchant.id, "winback-day-7", daysSinceExpiry);
            if (!alreadySent) {
              templateName = "winback-day-7";
            }
          }
          // Day +14: Final special pricing
          else if (daysSinceExpiry >= 14 && daysSinceExpiry < 15) {
            const alreadySent = await hasReceivedEmail(merchant.id, "winback-day-14", daysSinceExpiry);
            if (!alreadySent) {
              templateName = "winback-day-14";
            }
          }
          // Day +30: Fresh start invitation
          else if (daysSinceExpiry >= 30 && daysSinceExpiry < 31) {
            const alreadySent = await hasReceivedEmail(merchant.id, "winback-day-30", daysSinceExpiry);
            if (!alreadySent) {
              templateName = "winback-day-30";
            }
          }

          // Only send if we have a matching template
          if (templateName) {
            await sendWinbackEmail(merchant, daysSinceExpiry, templateName);
          }
        } catch (error: unknown) {
          captureException(error, {
            merchantId: merchant.id,
            storeId: merchant.storeId,
            operation: "process_winback_merchant",
          });
          
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("[WINBACK] Failed to process merchant", {
            error: err.message,
            merchantId: merchant.id,
            storeId: merchant.storeId,
          });
          // Continue processing other merchants
        }
      }
    },
    {
      operationName: "winback_campaign",
      workerType: "win-back",
    }
  );
}
  logger.info("[WINBACK] Win-back campaign processing completed", {
    app: "worker",
  });
}

/**
 * Main worker function
 */
export async function runWinbackCampaignWorker(): Promise<void> {
  try {
    logger.info("[WINBACK] Starting win-back campaign", {
      app: "worker",
    });

    await processWinbackCampaign();

    logger.info("[WINBACK] Win-back campaign completed", {
      app: "worker",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[WINBACK] Worker failed", {
      error: err.message,
      stack: err.stack,
      app: "worker",
    });
    throw error;
  }
}

// Export for cron job scheduling
export default runWinbackCampaignWorker;
