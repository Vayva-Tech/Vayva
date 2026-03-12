/**
 * Performance Monitor
 * Runtime performance monitoring and metrics collection
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'percent' | 'count';
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface PerformanceThreshold {
  warning: number;
  critical: number;
}

export interface MonitoredOperation {
  name: string;
  startTime: number;
  tags?: Record<string, string>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeOperations = new Map<string, MonitoredOperation>();
  private thresholds = new Map<string, PerformanceThreshold>();
  private listeners: Array<(metric: PerformanceMetric) => void> = [];
  private maxMetricsSize: number;

  constructor(options: { maxMetricsSize?: number } = {}) {
    this.maxMetricsSize = options.maxMetricsSize || 10000;
  }

  /**
   * Start monitoring an operation
   */
  startOperation(name: string, tags?: Record<string, string>): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.activeOperations.set(id, {
      name,
      startTime: performance.now(),
      tags,
    });
    return id;
  }

  /**
   * End monitoring an operation and record its duration
   */
  endOperation(id: string, additionalTags?: Record<string, string>): PerformanceMetric | null {
    const operation = this.activeOperations.get(id);
    if (!operation) {
      console.warn(`Operation ${id} not found`);
      return null;
    }

    this.activeOperations.delete(id);
    const duration = performance.now() - operation.startTime;

    const metric: PerformanceMetric = {
      name: operation.name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags: { ...operation.tags, ...additionalTags },
    };

    this.recordMetric(metric);
    return metric;
  }

  /**
   * Record a metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep metrics array within size limit
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(metric);
      } catch (error) {
        console.error('Error in metric listener:', error);
      }
    });

    // Check thresholds
    this.checkThreshold(metric);
  }

  /**
   * Set threshold for a metric
   */
  setThreshold(metricName: string, threshold: PerformanceThreshold): void {
    this.thresholds.set(metricName, threshold);
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThreshold(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      console.error(
        `[PERFORMANCE CRITICAL] ${metric.name}: ${metric.value}${metric.unit} ` +
        `(threshold: ${threshold.critical})`
      );
    } else if (metric.value >= threshold.warning) {
      console.warn(
        `[PERFORMANCE WARNING] ${metric.name}: ${metric.value}${metric.unit} ` +
        `(threshold: ${threshold.warning})`
      );
    }
  }

  /**
   * Subscribe to metrics
   */
  onMetric(listener: (metric: PerformanceMetric) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string, timeWindowMs?: number): PerformanceMetric[] {
    let metrics = this.metrics.filter(m => m.name === name);

    if (timeWindowMs) {
      const cutoff = new Date(Date.now() - timeWindowMs);
      metrics = metrics.filter(m => m.timestamp >= cutoff);
    }

    return metrics;
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string, timeWindowMs?: number): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.getMetrics(name, timeWindowMs);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p50: this.calculatePercentile(values, 0.5),
      p95: this.calculatePercentile(values, 0.95),
      p99: this.calculatePercentile(values, 0.99),
    };
  }

  /**
   * Calculate percentile from sorted values
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil(sortedValues.length * percentile) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): Array<{ name: string; duration: number; tags?: Record<string, string> }> {
    const now = performance.now();
    return Array.from(this.activeOperations.entries()).map(([, op]) => ({
      name: op.name,
      duration: now - op.startTime,
      tags: op.tags,
    }));
  }

  /**
   * Create a wrapped function that monitors its execution time
   */
  monitor<T extends (...args: unknown[]) => unknown>(
    name: string,
    fn: T,
    tags?: Record<string, string>
  ): T {
    return (async (...args: unknown[]) => {
      const id = this.startOperation(name, tags);
      try {
        const result = await fn(...args);
        this.endOperation(id, { status: 'success' });
        return result;
      } catch (error) {
        this.endOperation(id, { status: 'error', error: (error as Error).message });
        throw error;
      }
    }) as T;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(timeWindowMs?: number): object {
    const cutoff = timeWindowMs ? new Date(Date.now() - timeWindowMs) : null;
    const metrics = cutoff
      ? this.metrics.filter(m => m.timestamp >= cutoff)
      : this.metrics;

    return {
      exportedAt: new Date().toISOString(),
      metricCount: metrics.length,
      metrics: metrics.map(m => ({
        name: m.name,
        value: m.value,
        unit: m.unit,
        timestamp: m.timestamp.toISOString(),
        tags: m.tags,
      })),
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
