/**
 * @vayva/reliability
 * Reliability, metrics, and monitoring utilities
 */

// Health Monitor
export { HealthMonitor } from './health-monitor';
export type { HealthCheckResult, HealthStatus } from './health-monitor';

// Metrics
export {
  MetricsManagerClass,
  metricsManager,
  recordMetric,
  incrementCounter,
  recordTimer,
  recordGauge,
  getMetricStats,
  Metrics,
} from './metrics';

export type { MetricType, MetricValue, MetricStats, MetricQuery } from './metrics';

// Idempotency
export { IdempotencyService } from './idempotency';

// Job Wrapper
export { JobWrapper } from './job-wrapper';

// Outbox Worker
export { OutboxWorker } from './outbox-worker';
