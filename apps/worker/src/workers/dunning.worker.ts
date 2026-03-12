/**
 * Dunning Management Worker
 * 
 * Handles failed payment recovery workflow:
 * - Scheduled retry attempts
 * - WhatsApp notifications
 * - Account suspension
 */

import { Worker, Queue } from "bullmq";
import { DunningManager } from "@vayva/billing";
import { QUEUES, logger } from "@vayva/shared";
import type { RedisConnection } from "../types";

interface DunningJobData {
  type: "process-retries" | "handle-failure";
  subscriptionId?: string;
}

export function registerDunningWorker(connection: RedisConnection): void {
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, {
    connection,
  });

  new Worker(
    QUEUES.DUNNING,
    async (job) => {
      const { type, subscriptionId } = job.data as DunningJobData;

      logger.info("[DUNNING_WORKER] Processing job", { type, subscriptionId });

      try {
        const context = {
          whatsappQueue: whatsappOutboundQueue,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng",
        };

        switch (type) {
          case "process-retries":
            await DunningManager.processScheduledRetries(context);
            break;

          case "handle-failure":
            if (!subscriptionId) {
              throw new Error("subscriptionId required for handle-failure");
            }
            await DunningManager.handleFailedPayment(subscriptionId, context);
            break;

          default:
            logger.warn("[DUNNING_WORKER] Unknown job type", { type });
        }

        logger.info("[DUNNING_WORKER] Job completed", { type, subscriptionId });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[DUNNING_WORKER] Job failed", {
          error: err.message,
          type,
          subscriptionId,
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
      lockDuration: 300000, // 5 minutes
    }
  );

  logger.info("Registered dunning worker", {
    queue: QUEUES.DUNNING,
    app: "worker",
  });
}

/**
 * Schedule dunning retry processing
 */
export async function scheduleDunningJobs(queue: Queue): Promise<void> {
  // Process retries daily at 9 AM
  await queue.add(
    "process-retries",
    { type: "process-retries" },
    {
      repeat: { pattern: "0 9 * * *" },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  logger.info("Scheduled dunning retry processing", { app: "worker" });
}

/**
 * Trigger dunning for a failed payment
 */
export async function triggerDunning(
  queue: Queue,
  subscriptionId: string
): Promise<void> {
  await queue.add(
    `failure-${subscriptionId}`,
    { type: "handle-failure", subscriptionId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  );

  logger.info("[DUNNING] Triggered dunning for subscription", {
    subscriptionId,
  });
}
