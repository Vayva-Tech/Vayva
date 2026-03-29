import type {
  IndustryDashboardDefinition,
  AlertThreshold,
} from '../../config/industry-dashboard-definitions';

interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  evidence?: { key: string; value: number };
}

type MetricValues = Record<string, number>;

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/**
 * Dashboard Alerts Service
 * Evaluates metric thresholds and generates prioritized alerts
 */
export class DashboardAlertsService {
  constructor() {}

  /**
   * Evaluate a threshold against an actual metric value
   */
  private evaluateThreshold(threshold: AlertThreshold, actual: number): boolean {
    switch (threshold.operator) {
      case 'gt':
        return actual > threshold.value;
      case 'lt':
        return actual < threshold.value;
      case 'eq':
        return actual === threshold.value;
      case 'gte':
        return actual >= threshold.value;
      case 'lte':
        return actual <= threshold.value;
      default:
        return false;
    }
  }

  /**
   * Interpolate message template with actual values
   */
  private interpolateMessage(template: string, actual: number): string {
    return template
      .replace('{count}', String(actual))
      .replace('{value}', String(actual));
  }

  /**
   * Compute dashboard alerts based on industry definition and current metrics
   * 
   * @param definition - Industry-specific dashboard definition with alert thresholds
   * @param metrics - Current metric values to evaluate
   * @returns Prioritized list of alerts sorted by severity
   */
  computeDashboardAlerts(
    definition: IndustryDashboardDefinition,
    metrics: MetricValues,
  ): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    for (const threshold of definition.alertThresholds) {
      const actual = metrics[threshold.key];
      if (actual === undefined || actual === null) continue;

      if (this.evaluateThreshold(threshold, actual)) {
        alerts.push({
          id: threshold.key,
          title: threshold.label,
          message: this.interpolateMessage(threshold.message, actual),
          severity: threshold.severity,
          evidence: { key: threshold.key, value: actual },
        });
      }
    }

    // Sort by severity (critical → warning → info)
    alerts.sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
    );

    return alerts;
  }
}
