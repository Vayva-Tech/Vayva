/**
 * Metrics Collection Framework
 * Prometheus-compatible metrics with Datadog integration
 */

import { logger } from '@vayva/shared';

// ============================================================================
// Types
// ============================================================================
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricOptions {
  name: string;
  help: string;
  type: MetricType;
  labelNames?: string[];
  buckets?: number[]; // For histograms
  percentiles?: number[]; // For summaries
}

export interface MetricValue {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

// ============================================================================
// Metric Classes
// ============================================================================
class Counter {
  private value = 0;
  private labels = new Map<string, number>();

  constructor(private options: MetricOptions) {}

  inc(labels?: Record<string, string>, amount = 1) {
    if (labels) {
      const key = this.getLabelsKey(labels);
      const current = this.labels.get(key) || 0;
      this.labels.set(key, current + amount);
    } else {
      this.value += amount;
    }
  }

  get(): number | Map<string, number> {
    return this.labels.size > 0 ? this.labels : this.value;
  }

  private getLabelsKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
  }
}

class Gauge {
  private value = 0;
  private labels = new Map<string, number>();

  constructor(private options: MetricOptions) {}

  set(amount: number, labels?: Record<string, string>) {
    if (labels) {
      const key = this.getLabelsKey(labels);
      this.labels.set(key, amount);
    } else {
      this.value = amount;
    }
  }

  inc(labels?: Record<string, string>, amount = 1) {
    const current = this.get(labels) || 0;
    this.set(current + amount, labels);
  }

  dec(labels?: Record<string, string>, amount = 1) {
    const current = this.get(labels) || 0;
    this.set(current - amount, labels);
  }

  get(labels?: Record<string, string>): number {
    if (labels && this.labels.size > 0) {
      const key = this.getLabelsKey(labels);
      return this.labels.get(key) || 0;
    }
    return this.value;
  }

  private getLabelsKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
  }
}

class Histogram {
  private buckets: number[];
  private counts: number[];
  private sum = 0;
  private count = 0;

  constructor(private options: MetricOptions) {
    this.buckets = options.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    this.counts = new Array(this.buckets.length).fill(0);
  }

  observe(value: number) {
    this.sum += value;
    this.count++;
    
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        this.counts[i]++;
      }
    }
  }

  get(): { buckets: Array<{ le: number; count: number }>; sum: number; count: number } {
    return {
      buckets: this.buckets.map((le, i) => ({ le, count: this.counts[i] })),
      sum: this.sum,
      count: this.count,
    };
  }
}

// ============================================================================
// Metrics Registry
// ============================================================================
export class MetricsRegistry {
  private static instance: MetricsRegistry;
  private metrics = new Map<string, Counter | Gauge | Histogram>();
  private collectors: Array<() => void> = [];

  private constructor() {}

  static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }

  /**
   * Create and register a counter metric
   */
  createCounter(options: MetricOptions): Counter {
    if (this.metrics.has(options.name)) {
      throw new Error(`Metric ${options.name} already exists`);
    }
    const counter = new Counter(options);
    this.metrics.set(options.name, counter);
    return counter;
  }

  /**
   * Create and register a gauge metric
   */
  createGauge(options: MetricOptions): Gauge {
    if (this.metrics.has(options.name)) {
      throw new Error(`Metric ${options.name} already exists`);
    }
    const gauge = new Gauge(options);
    this.metrics.set(options.name, gauge);
    return gauge;
  }

  /**
   * Create and register a histogram metric
   */
  createHistogram(options: MetricOptions): Histogram {
    if (this.metrics.has(options.name)) {
      throw new Error(`Metric ${options.name} already exists`);
    }
    const histogram = new Histogram(options);
    this.metrics.set(options.name, histogram);
    return histogram;
  }

  /**
   * Get all metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    for (const [name, metric] of this.metrics) {
      const value = metric.get();
      
      if (metric instanceof Counter || metric instanceof Gauge) {
        lines.push(`# HELP ${name} ${(metric as any).options.help}`);
        lines.push(`# TYPE ${name} ${(metric as any).options.type}`);
        
        if (value instanceof Map) {
          for (const [labels, val] of value.entries()) {
            lines.push(`${name}{${labels}} ${val}`);
          }
        } else {
          lines.push(`${name} ${value}`);
        }
      } else if (metric instanceof Histogram) {
        const data = metric.get();
        lines.push(`# HELP ${name} ${(metric as any).options.help}`);
        lines.push(`# TYPE ${name} histogram`);
        
        for (const bucket of data.buckets) {
          lines.push(`${name}_bucket{le="${bucket.le}"} ${bucket.count}`);
        }
        lines.push(`${name}_bucket{le="+Inf"} ${data.count}`);
        lines.push(`${name}_sum ${data.sum}`);
        lines.push(`${name}_count ${data.count}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Register a collector function
   */
  registerCollector(collector: () => void) {
    this.collectors.push(collector);
  }

  /**
   * Collect all metrics
   */
  collect() {
    for (const collector of this.collectors) {
      collector();
    }
  }
}

// ============================================================================
// Pre-defined Application Metrics
// ============================================================================
const registry = MetricsRegistry.getInstance();

// HTTP Request Metrics
export const httpRequestsTotal = registry.createCounter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  type: 'counter',
  labelNames: ['method', 'path', 'status'],
});

export const httpRequestDuration = registry.createHistogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  type: 'histogram',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ['method', 'path'],
});

// Database Metrics
export const databaseQueriesTotal = registry.createCounter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  type: 'counter',
  labelNames: ['operation', 'table'],
});

export const databaseQueryDuration = registry.createHistogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration in seconds',
  type: 'histogram',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

// Business Metrics
export const ordersTotal = registry.createCounter({
  name: 'orders_total',
  help: 'Total number of orders',
  type: 'counter',
  labelNames: ['status', 'industry'],
});

export const orderValue = registry.createHistogram({
  name: 'order_value_total',
  help: 'Order value distribution',
  type: 'histogram',
  buckets: [100, 500, 1000, 2500, 5000, 10000, 25000, 50000],
});

export const activeUsers = registry.createGauge({
  name: 'active_users',
  help: 'Number of currently active users',
  type: 'gauge',
});

export const healthScoreAverage = registry.createGauge({
  name: 'health_score_average',
  help: 'Average health score across all stores',
  type: 'gauge',
});

// System Metrics
export const memoryUsage = registry.createGauge({
  name: 'node_memory_usage_bytes',
  help: 'Node.js memory usage',
  type: 'gauge',
});

export const eventLoopLag = registry.createHistogram({
  name: 'nodejs_event_loop_lag_seconds',
  help: 'Event loop lag in seconds',
  type: 'histogram',
  buckets: [0.001, 0.01, 0.1, 0.5, 1],
});

// ============================================================================
// Middleware Helpers
// ============================================================================

/**
 * Create HTTP request logging middleware
 */
export function createMetricsMiddleware() {
  return (req: unknown, res: { on: (event: string, cb: () => void) => void }, next: () => void) => {
    const start = Date.now();
    const method = (req as { method?: string }).method || 'UNKNOWN';
    const path = (req as { url?: string }).url || 'UNKNOWN';

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const status = (res as { statusCode?: number }).statusCode || 500;

      // Record metrics
      httpRequestsTotal.inc({ method, path, status: status.toString() });
      httpRequestDuration.observe(duration, { method, path });

      logger.debug('Request metrics recorded', {
        method,
        path,
        status,
        duration: `${duration}s`,
      });
    });

    next();
  };
}

/**
 * Collect system metrics periodically
 */
export function startSystemMetricsCollection(intervalMs = 60000) {
  setInterval(() => {
    const usage = process.memoryUsage();
    memoryUsage.set(usage.heapUsed);

    logger.debug('System metrics collected', {
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
    });
  }, intervalMs);
}

// ============================================================================
// Export registry
// ============================================================================
export { registry as metricsRegistry };
