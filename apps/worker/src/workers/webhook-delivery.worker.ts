import { Worker, Queue } from "bullmq";
import { prisma } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import type { RedisConnection } from "../types";
import crypto from "crypto";

/**
 * Webhook Delivery Worker
 *
 * Delivers webhooks to merchant endpoints with:
 * - HMAC signature verification
 * - Exponential backoff retry
 * - Delivery tracking
 */

interface WebhookDeliveryJobData {
  subscriptionId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export function registerWebhookDeliveryWorker(connection: RedisConnection): void {
  new Worker<WebhookDeliveryJobData>(
    QUEUES.WEBHOOK_DELIVERY,
    async (job) => {
      const { subscriptionId, eventType, payload } = job.data;

      try {
        // Get subscription details
        const subscription = await prisma.webhookSubscription.findUnique({
          where: { id: subscriptionId },
        });

        if (!subscription || !subscription.isActive) {
          logger.warn(`[WEBHOOK] Subscription ${subscriptionId} not found or inactive`, {
            app: "worker",
          });
          return;
        }

        // Create delivery record
        const delivery = await prisma.webhookDelivery.create({
          data: {
            subscriptionId,
            eventType,
            payload,
            signature: "", // Will be updated after signing
            status: "PENDING",
          },
        });

        // Sign payload
        const signature = signPayload(payload, subscription.secret);

        // Update delivery with signature
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { signature },
        });

        // Attempt delivery
        const result = await attemptDelivery(subscription.url, eventType, payload, signature, delivery.id);

        // Update delivery record
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: result.success ? "DELIVERED" : "FAILED",
            attempts: { increment: 1 },
            responseStatus: result.statusCode,
            responseBody: result.responseBody?.substring(0, 1000), // Limit response size
            deliveredAt: result.success ? new Date() : null,
          },
        });

        if (result.success) {
          logger.info(`[WEBHOOK] Delivered ${eventType} to ${subscription.url}`, {
            deliveryId: delivery.id,
            subscriptionId,
            app: "worker",
          });
        } else {
          throw new Error(`Delivery failed: ${result.error}`);
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`[WEBHOOK] Delivery failed for ${subscriptionId}`, {
          error: err.message,
          eventType,
          app: "worker",
        });
        throw error; // Trigger retry
      }
    },
    {
      connection,
      concurrency: 10,
      lockDuration: 30000,
    }
  );

  logger.info("Registered webhook delivery worker", {
    queue: QUEUES.WEBHOOK_DELIVERY,
    app: "worker",
  });
}

/**
 * Sign payload with HMAC-SHA256
 */
function signPayload(payload: Record<string, unknown>, secret: string): string {
  const payloadString = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
}

/**
 * Attempt to deliver webhook
 */
async function attemptDelivery(
  url: string,
  eventType: string,
  payload: Record<string, unknown>,
  signature: string,
  deliveryId: string
): Promise<{
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
}> {
  const maxRetries = 5;
  const backoffDelays = [60000, 300000, 900000, 3600000, 21600000]; // 1min, 5min, 15min, 1hr, 6hr

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Vayva-Signature": signature,
          "X-Vayva-Event": eventType,
          "X-Vayva-Delivery-Id": deliveryId,
          "User-Agent": "Vayva-Webhook/1.0",
        },
        body: JSON.stringify(payload),
        // 30 second timeout
        signal: AbortSignal.timeout(30000),
      });

      const responseBody = await response.text();

      // Success: 2xx status
      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          responseBody,
        };
      }

      // Failure: Don't retry on 4xx errors (client error)
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          statusCode: response.status,
          responseBody,
          error: `Client error ${response.status}`,
        };
      }

      // Server error: Retry with backoff
      if (attempt < maxRetries - 1) {
        await delay(backoffDelays[attempt]);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);

      // Network errors: Retry with backoff
      if (attempt < maxRetries - 1) {
        await delay(backoffDelays[attempt]);
      } else {
        return {
          success: false,
          error: errMsg,
        };
      }
    }
  }

  return {
    success: false,
    error: "Max retries exceeded",
  };
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Schedule a webhook delivery
 */
export async function scheduleWebhookDelivery(
  queue: Queue,
  subscriptionId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  await queue.add(
    "deliver",
    {
      subscriptionId,
      eventType,
      payload,
    },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 60000, // Start with 1 minute
      },
    }
  );
}
