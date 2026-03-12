/**
 * Analytics Tracker Client
 *
 * Privacy-first event tracking with template context attachment.
 * Events are batched and sent asynchronously.
 */

import { EventName } from "./events";

interface TrackEventOptions {
  userId: string;
  eventName: EventName;
  properties?: Record<string, unknown>;
  templateId?: string;
}

class AnalyticsTracker {
  private eventQueue: TrackEventOptions[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private flushInterval: any = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL_MS = 5000;

  constructor() {
    if (typeof window !== "undefined") {
      // Start auto-flush in browser environment
      this.startAutoFlush();
    }
  }

  /**
   * Track an event (idempotent for activation events)
   */
  async track(options: TrackEventOptions): Promise<void> {
    const { userId, eventName, properties = {}, templateId } = options;

    // Add template context if available
    const eventData = {
      userId,
      eventName,
      properties: {
        ...properties,
        ...(templateId && { templateId }),
        timestamp: new Date().toISOString(),
      },
    };

    // Add to queue
    this.eventQueue.push(eventData);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  /**
   * Flush queued events to backend
   */
  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error("Failed to send analytics events:", error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Stop auto-flush and flush remaining events
   */
  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flush();
  }
}

// Singleton instance
export const analytics = new AnalyticsTracker();

// Convenience methods
export const trackEvent = (options: TrackEventOptions) =>
  analytics.track(options);
