/**
 * Performance Metrics Aggregator
 * Collects and analyzes performance metrics from load tests
 */

export interface RequestMetric {
  success: boolean;
  statusCode: number;
  duration: number;
  error?: Error;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  latencies: number[];
  statusCodes: Record<number, number>;
  errors: Map<string, number>;
  startTime: number;
}

export interface LatencyStats {
  min: number;
  max: number;
  average: number;
  p50: number;
  p95: number;
  p99: number;
}

export class MetricsAggregator {
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    latencies: [],
    statusCodes: {},
    errors: new Map(),
    startTime: Date.now(),
  };

  constructor() {
    this.reset();
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      latencies: [],
      statusCodes: {},
      errors: new Map(),
      startTime: Date.now(),
    };
  }

  /**
   * Record a single request metric
   */
  recordRequest(metric: RequestMetric): void {
    this.metrics.totalRequests++;

    if (metric.success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Record latency
    this.metrics.latencies.push(metric.duration);

    // Record status code
    this.metrics.statusCodes[metric.statusCode] = 
      (this.metrics.statusCodes[metric.statusCode] || 0) + 1;

    // Record error
    if (metric.error) {
      const errorKey = metric.error.message || 'Unknown error';
      this.metrics.errors.set(errorKey, (this.metrics.errors.get(errorKey) || 0) + 1);
    }
  }

  /**
   * Get total number of requests
   */
  getTotalRequests(): number {
    return this.metrics.totalRequests;
  }

  /**
   * Get number of successful requests
   */
  getSuccessfulRequests(): number {
    return this.metrics.successfulRequests;
  }

  /**
   * Get number of failed requests
   */
  getFailedRequests(): number {
    return this.metrics.failedRequests;
  }

  /**
   * Get average requests per second
   */
  getAverageRps(totalDurationMs: number): number {
    if (totalDurationMs === 0) return 0;
    return (this.metrics.totalRequests / totalDurationMs) * 1000;
  }

  /**
   * Get latency statistics
   */
  getLatencyStats(): LatencyStats {
    const latencies = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = latencies.length;

    if (count === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sum = latencies.reduce((a, b) => a + b, 0);

    return {
      min: latencies[0],
      max: latencies[count - 1],
      average: sum / count,
      p50: this.calculatePercentile(latencies, 0.5),
      p95: this.calculatePercentile(latencies, 0.95),
      p99: this.calculatePercentile(latencies, 0.99),
    };
  }

  /**
   * Get status code distribution
   */
  getStatusCodes(): Record<number, number> {
    return { ...this.metrics.statusCodes };
  }

  /**
   * Get error summary
   */
  getErrors(): Array<{ message: string; count: number }> {
    return Array.from(this.metrics.errors.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      latencies: [...this.metrics.latencies],
      statusCodes: { ...this.metrics.statusCodes },
      errors: new Map(this.metrics.errors),
    };
  }

  /**
   * Calculate a percentile from sorted latencies
   */
  private calculatePercentile(sortedLatencies: number[], percentile: number): number {
    const index = Math.ceil(sortedLatencies.length * percentile) - 1;
    return sortedLatencies[Math.max(0, index)];
  }

  /**
   * Generate a text report
   */
  generateReport(): string {
    const stats = this.getLatencyStats();
    const totalDuration = Date.now() - this.metrics.startTime;
    const rps = this.getAverageRps(totalDuration);
    const successRate = this.metrics.totalRequests > 0
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
      : 0;
    const errorRate = this.metrics.totalRequests > 0
      ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100
      : 0;

    const lines = [
      'Load Test Report',
      '================',
      '',
      `Total Requests: ${this.metrics.totalRequests}`,
      `Successful: ${this.metrics.successfulRequests}`,
      `Failed: ${this.metrics.failedRequests}`,
      `Success Rate: ${successRate.toFixed(2)}%`,
      `Error Rate: ${errorRate.toFixed(2)}%`,
      `Average RPS: ${rps.toFixed(2)}`,
      '',
      'Latency Statistics (ms):',
      `  Min: ${stats.min.toFixed(2)}`,
      `  Max: ${stats.max.toFixed(2)}`,
      `  Average: ${stats.average.toFixed(2)}`,
      `  p50: ${stats.p50.toFixed(2)}`,
      `  p95: ${stats.p95.toFixed(2)}`,
      `  p99: ${stats.p99.toFixed(2)}`,
      '',
      'Status Codes:',
      ...Object.entries(this.metrics.statusCodes)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([code, count]) => `  ${code}: ${count}`),
    ];

    if (this.metrics.errors.size > 0) {
      lines.push('', 'Errors:');
      this.metrics.errors.forEach((count, message) => {
        lines.push(`  ${message}: ${count}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Compare metrics against benchmarks
   */
  compareAgainstBenchmarks(benchmarks: {
    p95Latency?: number;
    p99Latency?: number;
    avgLatency?: number;
    targetRps?: number;
    maxErrorRate?: number;
    minSuccessRate?: number;
  }): {
    passed: boolean;
    metrics: {
      p95Latency: { actual: number; target: number; passed: boolean };
      p99Latency: { actual: number; target: number; passed: boolean };
      avgLatency: { actual: number; target: number; passed: boolean };
      rps: { actual: number; target: number; passed: boolean };
      errorRate: { actual: number; target: number; passed: boolean };
      successRate: { actual: number; target: number; passed: boolean };
    };
    summary: string;
  } {
    const stats = this.getLatencyStats();
    const totalDuration = Date.now() - this.metrics.startTime;
    const rps = this.getAverageRps(totalDuration);
    const successRate = this.metrics.totalRequests > 0
      ? (this.metrics.successfulRequests / this.metrics.totalRequests)
      : 0;
    const errorRate = this.metrics.totalRequests > 0
      ? (this.metrics.failedRequests / this.metrics.totalRequests)
      : 0;

    const comparisons = {
      p95Latency: {
        actual: stats.p95,
        target: benchmarks.p95Latency ?? 0,
        passed: benchmarks.p95Latency !== undefined ? stats.p95 <= benchmarks.p95Latency : true,
      },
      p99Latency: {
        actual: stats.p99,
        target: benchmarks.p99Latency ?? 0,
        passed: benchmarks.p99Latency !== undefined ? stats.p99 <= benchmarks.p99Latency : true,
      },
      avgLatency: {
        actual: stats.average,
        target: benchmarks.avgLatency ?? 0,
        passed: benchmarks.avgLatency !== undefined ? stats.average <= benchmarks.avgLatency : true,
      },
      rps: {
        actual: rps,
        target: benchmarks.targetRps ?? 0,
        passed: benchmarks.targetRps !== undefined ? rps >= benchmarks.targetRps : true,
      },
      errorRate: {
        actual: errorRate,
        target: benchmarks.maxErrorRate ?? 0,
        passed: benchmarks.maxErrorRate !== undefined ? errorRate <= benchmarks.maxErrorRate : true,
      },
      successRate: {
        actual: successRate,
        target: benchmarks.minSuccessRate ?? 0,
        passed: benchmarks.minSuccessRate !== undefined ? successRate >= benchmarks.minSuccessRate : true,
      },
    };

    const allPassed = Object.values(comparisons).every(c => c.passed);

    return {
      passed: allPassed,
      metrics: comparisons,
      summary: allPassed
        ? 'All benchmarks passed!'
        : `Failed benchmarks: ${Object.entries(comparisons)
            .filter(([, c]) => !c.passed)
            .map(([name]) => name)
            .join(', ')}`,
    };
  }

  /**
   * Export metrics as JSON
   */
  toJSON(): object {
    const stats = this.getLatencyStats();
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        statusCodes: this.metrics.statusCodes,
      },
      latency: stats,
      errors: Array.from(this.metrics.errors.entries()).map(([message, count]) => ({
        message,
        count,
      })),
    };
  }
}
