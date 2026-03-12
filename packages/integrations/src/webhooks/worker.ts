/**
 * Webhook Delivery Worker
 * Processes pending webhook deliveries with retry logic
 */

import { logger } from '@vayva/shared';
import { webhookManager } from './manager';

export interface WebhookWorkerConfig {
  batchSize: number;
  pollIntervalMs: number;
  maxConcurrent: number;
}

const DEFAULT_CONFIG: WebhookWorkerConfig = {
  batchSize: 10,
  pollIntervalMs: 5000, // 5 seconds
  maxConcurrent: 5,
};

export class WebhookWorker {
  private config: WebhookWorkerConfig;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private processingCount = 0;

  constructor(config: Partial<WebhookWorkerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the webhook worker
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('[WebhookWorker] Worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('[WebhookWorker] Started', { config: this.config });

    // Process immediately on start
    this.processBatch();

    // Set up polling interval
    this.intervalId = setInterval(() => {
      this.processBatch();
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop the webhook worker
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('[WebhookWorker] Stopped');
  }

  /**
   * Process a batch of pending deliveries
   */
  private async processBatch(): Promise<void> {
    // Don't process if at max concurrency
    if (this.processingCount >= this.config.maxConcurrent) {
      return;
    }

    const availableSlots = this.config.maxConcurrent - this.processingCount;
    const batchSize = Math.min(this.config.batchSize, availableSlots);

    try {
      const processed = await webhookManager.processPendingDeliveries(batchSize);
      
      if (processed > 0) {
        logger.debug('[WebhookWorker] Processed batch', {
          processed,
          remaining: this.processingCount,
        });
      }
    } catch (error) {
      logger.error('[WebhookWorker] Failed to process batch', { error });
    }
  }

  /**
   * Get worker status
   */
  getStatus(): {
    isRunning: boolean;
    processingCount: number;
    config: WebhookWorkerConfig;
  } {
    return {
      isRunning: this.isRunning,
      processingCount: this.processingCount,
      config: this.config,
    };
  }

  /**
   * Process a single delivery immediately (for manual retry)
   */
  async processDelivery(deliveryId: string): Promise<boolean> {
    this.processingCount++;
    try {
      // This would need the endpoint info - simplified version
      logger.info('[WebhookWorker] Processing delivery', { deliveryId });
      return true;
    } finally {
      this.processingCount--;
    }
  }
}

// Export singleton instance
export const webhookWorker = new WebhookWorker();

// For use in external worker processes
export function createWebhookWorker(config?: Partial<WebhookWorkerConfig>): WebhookWorker {
  return new WebhookWorker(config);
}
