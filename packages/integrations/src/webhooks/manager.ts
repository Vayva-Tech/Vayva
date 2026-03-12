/**
 * Webhook Manager Service
 * Handles webhook endpoint management, event delivery, retries, and monitoring
 */

import { randomBytes, createHmac } from 'crypto';
// Note: prisma models would be defined in schema when needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    webhookEndpoint: {
        create: async () => ({ id: 'wh_123' }),
        findMany: async () => [],
        findFirst: async () => null,
        update: async () => ({}),
        deleteMany: async () => {},
        findUnique: async () => null,
        updateMany: async () => ({}),
    },
    webhookEventV2: {
        create: async () => ({ id: 'evt_123' }),
        findUnique: async () => null,
    },
    webhookDelivery: {
        create: async () => ({ id: 'del_123' }),
        findMany: async () => [],
        findUnique: async () => null,
        update: async () => ({}),
    },
};
import { logger } from '@vayva/shared';
import type {
  WebhookEndpoint,
  WebhookEndpointStatus,
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookEvent,
  WebhookEventType,
  WebhookPayload,
  CreateWebhookInput,
  WebhookDeliveryStats,
} from '../types';

const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000]; // 1s, 5s, 15s, 1min, 5min

function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  retryAfter?: number;
}

export class WebhookManager {
  /**
   * Create a new webhook endpoint
   */
  async createWebhook(input: CreateWebhookInput): Promise<WebhookEndpoint> {
    const secret = input.secret || generateWebhookSecret();

    try {
      const webhook = await prisma.webhookEndpoint.create({
        data: {
          storeId: input.storeId,
          url: input.url,
          status: 'ACTIVE',
          secretEnc: secret, // In production, encrypt this
          subscribedEvents: input.events,
        },
      }) as WebhookEndpoint;

      logger.info('[WebhookManager] Created webhook endpoint', {
        webhookId: webhook.id,
        storeId: input.storeId,
        url: input.url,
        events: input.events,
      });

      return webhook;
    } catch (error) {
      logger.error('[WebhookManager] Failed to create webhook', { error, input });
      throw new Error('Failed to create webhook endpoint');
    }
  }

  /**
   * Get webhook endpoints for a store
   */
  async getWebhooks(storeId: string, status?: WebhookEndpointStatus): Promise<WebhookEndpoint[]> {
    const where: Record<string, unknown> = { storeId };
    if (status) {
      where.status = status;
    }

    return await prisma.webhookEndpoint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }) as WebhookEndpoint[];
  }

  /**
   * Get a single webhook by ID
   */
  async getWebhook(storeId: string, webhookId: string): Promise<WebhookEndpoint | null> {
    return await prisma.webhookEndpoint.findFirst({
      where: { id: webhookId, storeId },
    }) as WebhookEndpoint | null;
  }

  /**
   * Update webhook endpoint
   */
  async updateWebhook(
    storeId: string,
    webhookId: string,
    updates: Partial<Pick<WebhookEndpoint, 'url' | 'status' | 'subscribedEvents'>>
  ): Promise<WebhookEndpoint> {
    const updateData: Record<string, unknown> = {};
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.subscribedEvents !== undefined) updateData.subscribedEvents = updates.subscribedEvents;
    
    const webhook = await prisma.webhookEndpoint.update({
      where: { id: webhookId },
      data: updateData,
    }) as WebhookEndpoint;

    logger.info('[WebhookManager] Updated webhook endpoint', {
      webhookId,
      storeId,
      updates: Object.keys(updates),
    });

    return webhook;
  }

  /**
   * Delete webhook endpoint
   */
  async deleteWebhook(storeId: string, webhookId: string): Promise<void> {
    await prisma.webhookEndpoint.deleteMany({
      where: { id: webhookId, storeId },
    });

    logger.info('[WebhookManager] Deleted webhook endpoint', { webhookId, storeId });
  }

  /**
   * Regenerate webhook secret
   */
  async regenerateSecret(storeId: string, webhookId: string): Promise<string> {
    const newSecret = generateWebhookSecret();

    await prisma.webhookEndpoint.update({
      where: { id: webhookId },
      data: { secretEnc: newSecret },
    });

    logger.info('[WebhookManager] Regenerated webhook secret', { webhookId, storeId });

    return newSecret;
  }

  /**
   * Trigger an event and deliver to all subscribed webhooks
   */
  async triggerEvent(
    storeId: string,
    eventType: WebhookEventType,
    payload: Record<string, unknown>
  ): Promise<void> {
    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
        OR: [
          { subscribedEvents: { has: eventType } },
          { subscribedEvents: { has: '*' } },
        ],
      },
    }) as WebhookEndpoint[];

    if (webhooks.length === 0) {
      return;
    }

    // Create event record
    const event = await prisma.webhookEventV2.create({
      data: {
        storeId,
        type: eventType,
        payload: payload as never,
      },
    }) as WebhookEvent;

    // Queue deliveries
    for (const webhook of webhooks) {
      await this.queueDelivery(webhook, event);
    }

    logger.info('[WebhookManager] Triggered event', {
      eventId: event.id,
      storeId,
      eventType,
      webhookCount: webhooks.length,
    });
  }

  /**
   * Queue a webhook delivery
   */
  private async queueDelivery(webhook: WebhookEndpoint, event: WebhookEvent): Promise<void> {
    await prisma.webhookDelivery.create({
      data: {
        storeId: webhook.storeId,
        endpointId: webhook.id,
        eventId: event.id,
        eventType: event.type,
        status: 'PENDING',
        attempt: 0,
      },
    });
  }

  /**
   * Process pending webhook deliveries
   * Call this from a worker
   */
  async processPendingDeliveries(batchSize: number = 10): Promise<number> {
    const pendingDeliveries = await prisma.webhookDelivery.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { nextRetryAt: { lte: new Date() } },
          { nextRetryAt: null },
        ],
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    }) as WebhookDelivery[];

    for (const delivery of pendingDeliveries) {
      const endpoint = await prisma.webhookEndpoint.findUnique({
        where: { id: delivery.endpointId },
      }) as WebhookEndpoint | null;
      
      if (endpoint) {
        await this.deliverWebhook(delivery, endpoint);
      }
    }

    return pendingDeliveries.length;
  }

  /**
   * Deliver a webhook
   */
  async deliverWebhook(
    delivery: WebhookDelivery,
    endpoint: WebhookEndpoint
  ): Promise<WebhookDeliveryResult> {
    const event = await prisma.webhookEventV2.findUnique({
      where: { id: delivery.eventId },
    }) as WebhookEvent | null;

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const payload: WebhookPayload = {
      event: event.type,
      timestamp: new Date().toISOString(),
      data: event.payload,
    };

    const payloadString = JSON.stringify(payload);
    const signature = signPayload(payloadString, endpoint.secretEnc);

    const startTime = Date.now();

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vayva-Signature': `sha256=${signature}`,
          'X-Vayva-Event': event.type,
          'X-Vayva-Delivery': delivery.id,
          'X-Vayva-Attempt': String(delivery.attempt + 1),
          'User-Agent': 'Vayva-Webhook/1.0',
        },
        body: payloadString,
        // 30 second timeout
        signal: AbortSignal.timeout(30000),
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text().catch(() => '');

      if (response.ok) {
        // Success
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'DELIVERED',
            responseCode: response.status,
            responseBodySnippet: responseBody.slice(0, 1000),
            deliveredAt: new Date(),
          },
        });

        logger.info('[WebhookManager] Webhook delivered', {
          deliveryId: delivery.id,
          endpointId: endpoint.id,
          eventType: event.type,
          responseTime,
          statusCode: response.status,
        });

        return {
          success: true,
          statusCode: response.status,
          responseBody,
        };
      } else {
        // Failed with non-2xx status
        throw new Error(`HTTP ${response.status}: ${responseBody.slice(0, 200)}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const responseTime = Date.now() - startTime;

      // Schedule retry
      const nextAttempt = delivery.attempt + 1;
      const shouldRetry = nextAttempt < MAX_RETRIES;
      
      if (shouldRetry) {
        const retryDelay = RETRY_DELAYS[delivery.attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        const nextRetryAt = new Date(Date.now() + retryDelay);
      
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'PENDING',
            attempt: nextAttempt,
            nextRetryAt,
            responseBodySnippet: errorMessage.slice(0, 500),
          },
        });

        logger.warn('[WebhookManager] Webhook delivery failed, will retry', {
          deliveryId: delivery.id,
          endpointId: endpoint.id,
          eventType: event.type,
          attempt: nextAttempt,
          maxRetries: MAX_RETRIES,
          nextRetryAt,
          error: errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
          retryAfter: retryDelay,
        };
      } else {
        // Max retries exceeded
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'FAILED',
            responseBodySnippet: errorMessage.slice(0, 500),
          },
        });

        logger.error('[WebhookManager] Webhook delivery failed permanently', {
          deliveryId: delivery.id,
          endpointId: endpoint.id,
          eventType: event.type,
          attempts: nextAttempt,
          error: errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    }
  }

  /**
   * Get delivery stats for a webhook
   */
  async getDeliveryStats(webhookId: string, hours: number = 24): Promise<WebhookDeliveryStats> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const deliveries = await prisma.webhookDelivery.findMany({
      where: {
        endpointId: webhookId,
        createdAt: { gte: since },
      },
    }) as WebhookDelivery[];

    const total = deliveries.length;
    const successful = deliveries.filter(d => d.status === 'DELIVERED').length;
    const failed = deliveries.filter(d => d.status === 'FAILED' || d.status === 'DEAD').length;
    const pending = deliveries.filter(d => d.status === 'PENDING').length;

    // Calculate average response time for successful deliveries
    const successfulDeliveries = deliveries.filter(d => d.status === 'DELIVERED' && d.deliveredAt);
    const avgResponseTime = successfulDeliveries.length > 0
      ? successfulDeliveries.reduce((acc, d) => {
          const deliveryTime = d.deliveredAt!.getTime() - d.createdAt.getTime();
          return acc + deliveryTime;
        }, 0) / successfulDeliveries.length
      : 0;

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageResponseTime: Math.round(avgResponseTime),
    };
  }

  /**
   * Get recent deliveries for a webhook
   */
  async getRecentDeliveries(
    webhookId: string,
    limit: number = 50,
    status?: WebhookDeliveryStatus
  ): Promise<(WebhookDelivery & { event: WebhookEvent | null })[]> {
    const where: Record<string, unknown> = { endpointId: webhookId };
    if (status) {
      where.status = status;
    }

    return await prisma.webhookDelivery.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) as (WebhookDelivery & { event: WebhookEvent | null })[];
  }

  /**
   * Replay a failed delivery
   */
  async replayDelivery(deliveryId: string): Promise<WebhookDeliveryResult> {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
    }) as WebhookDelivery | null;
    
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    
    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: { id: delivery.endpointId },
    }) as WebhookEndpoint | null;

    if (!endpoint) {
      throw new Error('Webhook endpoint not found');
    }

    if (endpoint.status !== 'ACTIVE') {
      throw new Error('Webhook endpoint is not active');
    }

    // Reset delivery for retry
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'PENDING',
        attempt: 0,
        nextRetryAt: null,
      },
    });

    logger.info('[WebhookManager] Replaying webhook delivery', {
      deliveryId,
      endpointId: endpoint.id,
    });

    // Deliver immediately
    return this.deliverWebhook(delivery, endpoint);
  }

  /**
   * Test a webhook endpoint
   */
  async testWebhook(storeId: string, url: string, secret?: string): Promise<WebhookDeliveryResult> {
    const testPayload = {
      event: 'test.event',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Vayva',
        storeId,
      },
    };

    const payloadString = JSON.stringify(testPayload);
    const testSecret = secret || generateWebhookSecret();
    const signature = signPayload(payloadString, testSecret);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vayva-Signature': `sha256=${signature}`,
          'X-Vayva-Event': 'test.event',
          'User-Agent': 'Vayva-Webhook/1.0 (Test)',
        },
        body: payloadString,
        signal: AbortSignal.timeout(30000),
      });

      const responseBody = await response.text().catch(() => '');

      return {
        success: response.ok,
        statusCode: response.status,
        responseBody,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Pause/unpause webhook endpoint
   */
  async setWebhookStatus(
    storeId: string,
    webhookId: string,
    status: WebhookEndpointStatus
  ): Promise<void> {
    await prisma.webhookEndpoint.updateMany({
      where: { id: webhookId, storeId },
      data: { status: status },
    });

    logger.info('[WebhookManager] Updated webhook status', {
      webhookId,
      storeId,
      status,
    });
  }
}

// Export singleton instance
export const webhookManager = new WebhookManager();
