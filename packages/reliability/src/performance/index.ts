import { performanceMonitor } from './monitor';
import { alertManager } from './alerts';
import { performanceOptimization } from './optimization';

/**
 * Performance Module
 * Exports all performance monitoring utilities
 */

export { PerformanceMonitor, performanceMonitor } from './monitor';
export type {
  PerformanceMetric,
  PerformanceThreshold,
  MonitoredOperation,
} from './monitor';

export { PerformanceAlertManager, alertManager } from './alerts';
export type { AlertRule, Alert, AlertHandler } from './alerts';

export { CodeProfiler, profiler } from './profiler';
export type { ProfileResult, ProfileSession, ProfileSpan } from './profiler';

export { PerformanceOptimizationService, performanceOptimization } from './optimization';
export type {
  CacheStrategy,
  DatabaseIndexType,
  QueryOptimizationStrategy,
  PerformanceMetricType,
  CacheConfiguration,
  DatabaseOptimization,
  QueryOptimization,
  CachingStrategy,
  PerformanceBaseline,
  ResourceOptimization,
  LoadBalancingStrategy,
  CDNConfiguration,
  AutoScalingConfiguration,
  PerformanceOptimizationReport
} from './optimization';

/**
 * Setup default performance monitoring
 */
export function setupPerformanceMonitoring(): void {
  // Setup default alert rules
  alertManager.setupDefaultRules();

  // Connect monitor to alert manager
  performanceMonitor.onMetric(metric => {
    alertManager.processMetric(metric);
  });

  console.log('Performance monitoring initialized');
}

/**
 * Decorator for monitoring function performance
 */
export function monitorPerformance(
  name?: string,
  tags?: Record<string, string>
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${(target as { constructor: { name: string } }).constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const id = performanceMonitor.startOperation(metricName, tags);
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endOperation(id, { status: 'success' });
        return result;
      } catch (error) {
        performanceMonitor.endOperation(id, {
          status: 'error',
          error: (error as Error).message,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Higher-order function for monitoring async functions
 */
export function withMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string,
  tags?: Record<string, string>
): T {
  return performanceMonitor.monitor(name, fn, tags) as T;
}
