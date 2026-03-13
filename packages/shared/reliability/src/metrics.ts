/**
 * Metrics Manager - Performance and reliability metrics tracking
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';

export interface MetricValue {
  name: string;
  value: number;
  type: MetricType;
  tags?: Record<string, string>;
  timestamp: number;
}

export interface MetricStats {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface MetricQuery {
  name: string;
  timeRange?: string;
  tags?: Record<string, string>;
}

export class MetricsManagerClass {
  private metrics = new Map<string, MetricValue[]>();
  private initialized = false;

  async init() {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  record(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricValue = {
      name,
      value,
      type: 'gauge',
      tags,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);
  }

  increment(name: string, tags?: Record<string, string>) {
    this.record(name, 1, tags);
  }

  histogram(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ) {
    const metric: MetricValue = {
      name,
      value,
      type: 'histogram',
      tags,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);
  }

  getStats(
    name: string,
    timeRange?: string,
    _tags?: Record<string, string>,
  ): MetricStats {
    const values = this.metrics.get(name) || [];

    // Filter by time range if provided
    let filteredValues = values;
    if (timeRange) {
      const now = Date.now();
      const rangeMs = this.parseTimeRange(timeRange);
      const cutoff = now - rangeMs;
      filteredValues = values.filter((v) => v.timestamp >= cutoff);
    }

    const numericValues = filteredValues.map((v) => v.value).sort((a, b) => a - b);

    if (numericValues.length === 0) {
      return {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const count = numericValues.length;
    const sum = numericValues.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = numericValues[0];
    const max = numericValues[count - 1];

    const p50 = this.percentile(numericValues, 50);
    const p95 = this.percentile(numericValues, 95);
    const p99 = this.percentile(numericValues, 99);

    return { count, sum, avg, min, max, p50, p95, p99 };
  }

  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)([hms])$/);
    if (!match) return 3600000; // default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      default:
        return 3600000;
    }
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }
}

export const metricsManager = new MetricsManagerClass();

// Convenience functions
export const recordMetric = (name: string, value: number, tags?: Record<string, string>) => {
  metricsManager.record(name, value, tags);
};

export const incrementCounter = (name: string, tags?: Record<string, string>) => {
  metricsManager.increment(name, tags);
};

export const recordTimer = (name: string, durationMs: number, tags?: Record<string, string>) => {
  metricsManager.histogram(`${name}.duration`, durationMs, tags);
};

export const recordGauge = (name: string, value: number, tags?: Record<string, string>) => {
  metricsManager.record(name, value, tags);
};

export const getMetricStats = (name: string, timeRange?: string, tags?: Record<string, string>) => {
  return metricsManager.getStats(name, timeRange, tags);
};

// Predefined metric names for consistency
export const Metrics = {
  API_LATENCY: 'api.latency',
  API_ERRORS: 'api.errors',
  WHATSAPP_DELIVERY_RATE: 'whatsapp.delivery.rate',
  ORDERS_CREATED: 'orders.created',
  PAYMENTS_PROCESSED: 'payments.processed',
} as const;
