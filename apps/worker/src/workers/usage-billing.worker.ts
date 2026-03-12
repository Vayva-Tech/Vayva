/**
 * Usage Billing Worker
 * 
 * Handles:
 * - Monthly invoice generation
 * - Threshold alert processing
 * - Usage aggregation
 */

import { Worker, Queue } from "bullmq";
import { UsageBillingService } from "@vayva/billing";
import { QUEUES, logger } from "@vayva/shared";
import { prisma } from "@vayva/db";
import type { RedisConnection } from "../types";

interface UsageBillingJobData {
  type: "generate-invoices" | "check-thresholds" | "record-usage";
  storeId?: string;
  metric?: string;
  quantity?: number;
}

export function registerUsageBillingWorker(connection: RedisConnection): void {
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, {
    connection,
  });

  new Worker(
    QUEUES.USAGE_BILLING,
    async (job) => {
      const { type, storeId, metric, quantity } = job.data as UsageBillingJobData;

      logger.info("[USAGE_BILLING_WORKER] Processing job", {
        type,
        storeId,
        metric,
      });

      try {
        switch (type) {
          case "generate-invoices":
            await generateMonthlyInvoices();
            break;

          case "check-thresholds":
            if (storeId && metric) {
              await processThresholdAlerts(storeId, metric, whatsappOutboundQueue);
            }
            break;

          case "record-usage":
            if (storeId && metric && quantity) {
              await UsageBillingService.recordUsage({
                storeId,
                metric: metric as any,
                quantity,
              });
            }
            break;

          default:
            logger.warn("[USAGE_BILLING_WORKER] Unknown job type", { type });
        }

        logger.info("[USAGE_BILLING_WORKER] Job completed", { type, storeId });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[USAGE_BILLING_WORKER] Job failed", {
          error: err.message,
          type,
          storeId,
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
      lockDuration: 300000, // 5 minutes
    }
  );

  logger.info("Registered usage billing worker", {
    queue: QUEUES.USAGE_BILLING,
    app: "worker",
  });
}

/**
 * Generate monthly invoices for all active subscriptions
 */
async function generateMonthlyInvoices(): Promise<void> {
  const now = new Date();
  
  // Get all active subscriptions
  const subscriptions = await prisma.merchantAiSubscription.findMany({
    where: {
      status: { in: ["UPGRADED_ACTIVE", "TRIAL_ACTIVE"] },
    },
    select: { storeId: true },
  });

  logger.info(`[USAGE_BILLING] Generating invoices for ${subscriptions.length} stores`);

  let successCount = 0;
  let errorCount = 0;

  for (const sub of subscriptions) {
    try {
      await UsageBillingService.createInvoice(sub.storeId);
      successCount++;
    } catch (error) {
      errorCount++;
      logger.error("[USAGE_BILLING] Failed to create invoice", {
        error,
        storeId: sub.storeId,
      });
    }
  }

  logger.info("[USAGE_BILLING] Invoice generation complete", {
    success: successCount,
    errors: errorCount,
  });
}

/**
 * Process threshold alerts and send notifications
 */
async function processThresholdAlerts(
  storeId: string,
  metric: string,
  whatsappQueue: Queue
): Promise<void> {
  // Get pending alerts
  const alerts = await prisma.usageThresholdAlert.findMany({
    where: {
      storeId,
      metric: metric as any,
      triggered: true,
      notifiedAt: null,
    },
  });

  if (alerts.length === 0) return;

  // Get store owner
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      memberships: {
        where: { role_enum: "OWNER" },
        include: { user: true },
      },
    },
  });

  const ownerPhone = store?.memberships?.[0]?.user?.phone;
  if (!ownerPhone) return;

  for (const alert of alerts) {
    const message = buildThresholdMessage(
      metric,
      alert.threshold,
      store.memberships[0]?.user?.firstName || "there"
    );

    await whatsappQueue.add("send", {
      to: ownerPhone,
      body: message,
    });

    // Mark as notified
    await prisma.usageThresholdAlert.update({
      where: { id: alert.id },
      data: { notifiedAt: new Date() },
    });

    logger.info("[USAGE_BILLING] Sent threshold alert", {
      storeId,
      metric,
      threshold: alert.threshold,
    });
  }
}

/**
 * Build threshold alert message
 */
function buildThresholdMessage(
  metric: string,
  threshold: number,
  name: string
): string {
  const metricLabels: Record<string, string> = {
    AI_TOKENS: "AI tokens",
    WHATSAPP_MESSAGES: "WhatsApp messages",
    WHATSAPP_MEDIA: "WhatsApp media",
    STORAGE_GB: "storage",
    API_CALLS: "API calls",
    BANDWIDTH_GB: "bandwidth",
  };

  const label = metricLabels[metric] || metric;
  const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng"}/dashboard/billing`;

  if (threshold >= 100) {
    return `Hi ${name}. You've reached your monthly ${label} limit. Additional usage will be charged at overage rates. View details: ${billingUrl}`;
  }

  return `Hi ${name}. You've used ${threshold}% of your monthly ${label} allowance. Consider upgrading to avoid overage charges. ${billingUrl}`;
}

/**
 * Schedule usage billing jobs
 */
export async function scheduleUsageBillingJobs(queue: Queue): Promise<void> {
  // Generate invoices on the 1st of each month at 3 AM
  await queue.add(
    "generate-monthly-invoices",
    { type: "generate-invoices" },
    {
      repeat: { pattern: "0 3 1 * *" },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  logger.info("Scheduled usage billing jobs", { app: "worker" });
}

/**
 * Queue usage recording
 */
export async function queueUsageRecord(
  queue: Queue,
  storeId: string,
  metric: string,
  quantity: number
): Promise<void> {
  await queue.add(
    `usage-${storeId}-${metric}`,
    { type: "record-usage", storeId, metric, quantity },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    }
  );
}
