/**
 * Custom Metrics System for Vayva Platform
 * 
 * Real-time metrics collection and aggregation that extends the existing
 * analytics infrastructure with live monitoring capabilities.
 * 
 * Features:
 * - Real-time metric recording
 * - Time-series aggregation
 * - Metric publishing via Redis pub/sub
 * - Automatic percentile calculations (p50, p95, p99)
 * - Metric retention and cleanup
 * 
 * @example
 * ```typescript
 * // Record a metric
 * await recordMetric('api.latency', 150, { 
 *   route: '/orders', 
 *   method: 'POST' 
 * });
 * 
 * // Increment a counter
 * await incrementCounter('orders.created', { currency: 'NGN' });
 * 
 * // Get aggregated metrics
 * const latencyStats = await getMetricStats('api.latency', '1h');
 * ```
 */

import { logger } from "@vayva/shared";

// Metric types
export type MetricType = "counter" | "gauge" | "histogram" | "timer";

export interface MetricValue {
  name: string;
  value: number;
  type: MetricType;
  tags: Record<string, string>;
  timestamp: number;
  unit?: string;
}

export interface MetricStats {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
  tags: Record<string, string>;
  timeRange: { start: number; end: number };
}

export interface MetricQuery {
  name: string;
  tags?: Record<string, string>;
  from?: number;
  to?: number;
  aggregation?: "sum" | "avg" | "min" | "max" | "count";
  interval?: string; // 1m, 5m, 1h, 1d
}

// In-memory storage (for development/single-instance)
// In production, this would use Redis or time-series DB
class MetricsStore {
  private metrics: MetricValue[] = [];
  private readonly MAX_METRICS = 10000;
  private readonly RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

  add(metric: MetricValue): void {
    this.metrics.push(metric);
    this.cleanup();
  }

  query(query: MetricQuery): MetricValue[] {
    return this.metrics.filter((m) => {
      if (m.name !== query.name) return false;
      if (query.from && m.timestamp < query.from) return false;
      if (query.to && m.timestamp > query.to) return false;
      if (query.tags) {
        for (const [key, value] of Object.entries(query.tags)) {
          if (m.tags[key] !== value) return false;
        }
      }
      return true;
    });
  }

  getStats(query: MetricQuery): MetricStats | null {
    const values = this.query(query).map((m) => m.value);
    
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;

    return {
      name: query.name,
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sum / count,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
      tags: query.tags || {},
      timeRange: {
        start: query.from || Math.min(...this.query(query).map((m) => m.timestamp)),
        end: query.to || Date.now(),
      },
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.RETENTION_MS;
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);

    // Hard limit
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  clear(): void {
    this.metrics = [];
  }
}

// Redis publisher (for distributed systems)
interface RedisClient {
  publish: (channel: string, message: string) => Promise<number>;
}

/**
 * Metrics Manager - Centralized metrics collection
 */
export class MetricsManager {
  private static instance: MetricsManager;
  private store = new MetricsStore();
  private redis: RedisClient | null = null;
  private redisChannel = "vayva:metrics";
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MetricsManager {
    if (!MetricsManager.instance) {
      MetricsManager.instance = new MetricsManager();
    }
    return MetricsManager.instance;
  }

  /**
   * Initialize with Redis for distributed metrics
   */
  async init(redis?: RedisClient): Promise<void> {
    if (this.isInitialized) return;

    if (redis) {
      this.redis = redis;
    } else {
      // Try to get Redis from shared package
      try {
        const shared = await import("@vayva/shared");
        // Check if getRedisClient exists (it may not be exported from shared)
        if ("getRedisClient" in shared) {
          this.redis = (shared as unknown as { getRedisClient: () => RedisClient }).getRedisClient();
        }
      } catch {
        logger.warn("[MetricsManager] Redis not available, using in-memory storage");
      }
    }

    this.isInitialized = true;
    logger.info("[MetricsManager] Initialized");
  }

  /**
   * Record a metric value
   */
  async record(
    name: string,
    value: number,
    options: {
      type?: MetricType;
      tags?: Record<string, string>;
      unit?: string;
    } = {}
  ): Promise<void> {
    const metric: MetricValue = {
      name,
      value,
      type: options.type || "gauge",
      tags: options.tags || {},
      timestamp: Date.now(),
      unit: options.unit,
    };

    // Store locally
    this.store.add(metric);

    // Publish to Redis for distributed consumers
    if (this.redis) {
      try {
        await this.redis.publish(
          this.redisChannel,
          JSON.stringify(metric)
        );
      } catch (error) {
        logger.error("[MetricsManager] Failed to publish metric", { error, name });
      }
    }
  }

  /**
   * Increment a counter metric
   */
  async increment(
    name: string,
    options: {
      value?: number;
      tags?: Record<string, string>;
    } = {}
  ): Promise<void> {
    await this.record(name, options.value || 1, {
      type: "counter",
      tags: options.tags,
    });
  }

  /**
   * Record a timer metric (duration in ms)
   */
  async timer(
    name: string,
    durationMs: number,
    options: {
      tags?: Record<string, string>;
    } = {}
  ): Promise<void> {
    await this.record(name, durationMs, {
      type: "timer",
      tags: options.tags,
      unit: "ms",
    });
  }

  /**
   * Time a function execution
   */
  async time<T>(
    name: string,
    fn: () => Promise<T> | T,
    options: {
      tags?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      return result;
    } finally {
      const duration = performance.now() - start;
      await this.timer(name, duration, options);
    }
  }

  /**
   * Set a gauge value
   */
  async gauge(
    name: string,
    value: number,
    options: {
      tags?: Record<string, string>;
      unit?: string;
    } = {}
  ): Promise<void> {
    await this.record(name, value, {
      type: "gauge",
      tags: options.tags,
      unit: options.unit,
    });
  }

  /**
   * Record a histogram value
   */
  async histogram(
    name: string,
    value: number,
    options: {
      tags?: Record<string, string>;
      unit?: string;
    } = {}
  ): Promise<void> {
    await this.record(name, value, {
      type: "histogram",
      tags: options.tags,
      unit: options.unit,
    });
  }

  /**
   * Get metric statistics
   */
  getStats(
    name: string,
    timeRange: string = "1h",
    tags?: Record<string, string>
  ): MetricStats | null {
    const { from, to } = this.parseTimeRange(timeRange);
    return this.store.getStats({
      name,
      tags,
      from,
      to,
    });
  }

  /**
   * Query raw metric values
   */
  query(query: MetricQuery): MetricValue[] {
    return this.store.query(query);
  }

  /**
   * Get multiple metric stats
   */
  getBatchStats(
    names: string[],
    timeRange: string = "1h"
  ): Record<string, MetricStats | null> {
    const result: Record<string, MetricStats | null> = {};
    for (const name of names) {
      result[name] = this.getStats(name, timeRange);
    }
    return result;
  }

  /**
   * Parse time range string to timestamps
   */
  private parseTimeRange(range: string): { from: number; to: number } {
    const to = Date.now();
    const multipliers: Record<string, number> = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = range.match(/^(\d+)([mhd])$/);
    if (!match) {
      return { from: to - 60 * 60 * 1000, to }; // Default 1 hour
    }

    const [, amount, unit] = match;
    const from = to - parseInt(amount) * multipliers[unit];
    return { from, to };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get health metrics summary
   */
  getHealthSummary(): {
    totalMetrics: number;
    uniqueNames: string[];
    timeRange: { oldest: number; newest: number };
  } {
    const allMetrics = this.store.query({ name: "" });
    const names = new Set(allMetrics.map((m) => m.name));
    const timestamps = allMetrics.map((m) => m.timestamp);

    return {
      totalMetrics: allMetrics.length,
      uniqueNames: Array.from(names),
      timeRange: {
        oldest: Math.min(...timestamps),
        newest: Math.max(...timestamps),
      },
    };
  }
}

// Export singleton instance
export const metricsManager = MetricsManager.getInstance();

// Convenience exports
export const recordMetric = (name: string, value: number, tags?: Record<string, string>) =>
  metricsManager.record(name, value, { tags });
export const incrementCounter = (name: string, tags?: Record<string, string>) =>
  metricsManager.increment(name, { tags });
export const recordTimer = (name: string, durationMs: number, tags?: Record<string, string>) =>
  metricsManager.timer(name, durationMs, { tags });
export const recordGauge = (name: string, value: number, tags?: Record<string, string>) =>
  metricsManager.gauge(name, value, { tags });
export const recordHistogram = (name: string, value: number, tags?: Record<string, string>) =>
  metricsManager.histogram(name, value, { tags });
export const timeFunction = <T>(name: string, fn: () => Promise<T> | T, tags?: Record<string, string>) =>
  metricsManager.time(name, fn, { tags });
export const getMetricStats = (name: string, timeRange?: string, tags?: Record<string, string>) =>
  metricsManager.getStats(name, timeRange, tags);

// Predefined metric names for consistency
export const Metrics = {
  // API Metrics
  API_LATENCY: "api.latency",
  API_REQUESTS: "api.requests",
  API_ERRORS: "api.errors",
  API_RATE_LIMITED: "api.rate_limited",

  // WhatsApp Metrics
  WHATSAPP_MESSAGES_SENT: "whatsapp.messages.sent",
  WHATSAPP_MESSAGES_RECEIVED: "whatsapp.messages.received",
  WHATSAPP_DELIVERY_RATE: "whatsapp.delivery.rate",
  WHATSAPP_RESPONSE_TIME: "whatsapp.response_time",

  // AI Metrics
  AI_TOKENS_USED: "ai.tokens.used",
  AI_REQUESTS: "ai.requests",
  AI_LATENCY: "ai.latency",
  AI_ERRORS: "ai.errors",

  // Order Metrics
  ORDERS_CREATED: "orders.created",
  ORDERS_COMPLETED: "orders.completed",
  ORDERS_CANCELLED: "orders.cancelled",
  ORDER_VALUE: "order.value",

  // Payment Metrics
  PAYMENTS_PROCESSED: "payments.processed",
  PAYMENT_SUCCESS_RATE: "payment.success_rate",
  PAYMENT_AMOUNT: "payment.amount",

  // User Metrics
  USER_LOGINS: "user.logins",
  USER_SIGNUPS: "user.signups",
  ACTIVE_SESSIONS: "active.sessions",

  // System Metrics
  DB_QUERY_TIME: "db.query_time",
  REDIS_OPS: "redis.ops",
  QUEUE_DEPTH: "queue.depth",
  MEMORY_USAGE: "system.memory",
  CPU_USAGE: "system.cpu",
} as const;

// Business metrics helpers
export const BusinessMetrics = {
  /**
   * Record order creation
   */
  async orderCreated(orderValue: number, currency: string, channel: string): Promise<void> {
    await Promise.all([
      incrementCounter(Metrics.ORDERS_CREATED, { currency, channel }),
      recordHistogram(Metrics.ORDER_VALUE, orderValue, { currency }),
    ]);
  },

  /**
   * Record payment completion
   */
  async paymentCompleted(amount: number, currency: string, method: string, success: boolean): Promise<void> {
    await Promise.all([
      incrementCounter(Metrics.PAYMENTS_PROCESSED, { currency, method, status: success ? "success" : "failed" }),
      recordHistogram(Metrics.PAYMENT_AMOUNT, amount, { currency, method }),
    ]);
  },

  /**
   * Record AI usage
   */
  async aiUsage(tokens: number, model: string, merchantId?: string): Promise<void> {
    await Promise.all([
      incrementCounter(Metrics.AI_REQUESTS, { model }),
      recordHistogram(Metrics.AI_TOKENS_USED, tokens, { model }),
    ]);
  },

  /**
   * Record WhatsApp message
   */
  async whatsappMessage(direction: "sent" | "received", type: string, delivered?: boolean): Promise<void> {
    const metric = direction === "sent" ? Metrics.WHATSAPP_MESSAGES_SENT : Metrics.WHATSAPP_MESSAGES_RECEIVED;
    await incrementCounter(metric, { type, delivered: delivered?.toString() || "unknown" });
  },

  /**
   * Record API request
   */
  async apiRequest(route: string, method: string, statusCode: number, durationMs: number): Promise<void> {
    await Promise.all([
      incrementCounter(Metrics.API_REQUESTS, { route, method, status: statusCode.toString() }),
      recordTimer(Metrics.API_LATENCY, durationMs, { route, method }),
    ]);

    if (statusCode >= 400) {
      await incrementCounter(Metrics.API_ERRORS, { route, method, status: statusCode.toString() });
    }
  },
};
