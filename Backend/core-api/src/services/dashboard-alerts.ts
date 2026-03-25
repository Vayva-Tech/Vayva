import type {
  IndustryDashboardDefinition,
  AlertThreshold
} from "@/config/industry-dashboard-definitions";

// ---------------------------------------------------------------------------
// Bottlenecks & Alerts Engine
//
// Pure function: takes an industry dashboard definition + live metric values,
// evaluates thresholds, and returns a prioritised list of alerts.
// ---------------------------------------------------------------------------

export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  evidence?: { key: string; value: number };
}

export type MetricValues = Record<string, number>;

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function evaluateThreshold(threshold: AlertThreshold, actual: number): boolean {
  switch (threshold.operator) {
    case "gt":
      return actual > threshold.value;
    case "lt":
      return actual < threshold.value;
    case "eq":
      return actual === threshold.value;
    case "gte":
      return actual >= threshold.value;
    case "lte":
      return actual <= threshold.value;
    default:
      return false;
  }
}

function interpolateMessage(template: string, actual: number): string {
  return template
    .replace("{count}", String(actual))
    .replace("{value}", String(actual));
}

export function computeDashboardAlerts(
  definition: IndustryDashboardDefinition,
  metrics: MetricValues,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  for (const threshold of definition.alertThresholds) {
    const actual = metrics[threshold.key];
    if (actual === undefined || actual === null) continue;

    if (evaluateThreshold(threshold, actual)) {
      alerts.push({
        id: threshold.key,
        title: threshold.label,
        message: interpolateMessage(threshold.message, actual),
        severity: threshold.severity,
        evidence: { key: threshold.key, value: actual },
      });
    }
  }

  alerts.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );

  return alerts;
}
