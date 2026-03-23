/**
 * Stub for @vayva/reliability package
 * Provides health monitoring and metrics until the full package is built
 */

interface MetricStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

interface HealthCheckResult {
  ok: boolean;
  message: string;
}

interface HealthCheckConfig {
  name: string;
  category: string;
  timeoutMs: number;
  check: () => Promise<HealthCheckResult>;
}

interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  checks: Record<string, {
    name: string;
    category: string;
    status: 'ok' | 'error';
    message: string;
    latencyMs: number;
  }>;
}

/**
 * Get metric statistics for a given metric name and time range
 * Returns stub data — connect to your metrics backend (Prometheus, etc.) in production
 */
export async function getMetricStats(_metricName: string, _timeRange: string): Promise<MetricStats> {
  return {
    count: 0,
    avg: 0,
    min: 0,
    max: 0,
    p50: 0,
    p95: 0,
    p99: 0,
  };
}

class MetricsManagerImpl {
  async init(): Promise<void> {
    // Initialize connection to metrics backend
  }
}

export const metricsManager = new MetricsManagerImpl();

/**
 * Health monitor for checking service dependencies
 */
const healthChecks = new Map<string, HealthCheckConfig>();

export const HealthMonitor = {
  registerCheck(id: string, config: HealthCheckConfig): void {
    healthChecks.set(id, config);
  },

  async runChecks(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};
    let hasError = false;

    for (const [id, config] of healthChecks.entries()) {
      const start = Date.now();
      try {
        const result = await Promise.race([
          config.check(),
          new Promise<HealthCheckResult>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), config.timeoutMs)
          ),
        ]);
        checks[id] = {
          name: config.name,
          category: config.category,
          status: result.ok ? 'ok' : 'error',
          message: result.message,
          latencyMs: Date.now() - start,
        };
        if (!result.ok) hasError = true;
      } catch (error) {
        hasError = true;
        checks[id] = {
          name: config.name,
          category: config.category,
          status: 'error',
          message: error instanceof Error ? error.message : 'Check failed',
          latencyMs: Date.now() - start,
        };
      }
    }

    return {
      status: hasError ? 'DEGRADED' : 'HEALTHY',
      timestamp: new Date().toISOString(),
      checks,
    };
  },
};
