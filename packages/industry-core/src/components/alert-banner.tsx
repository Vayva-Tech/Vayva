// ============================================================================
// Alert Banner
// ============================================================================
// Displays dashboard alerts with severity-based styling
// ============================================================================

import { useDashboard } from "./dashboard-container.js";
import type { Alert } from "../types.js";

interface AlertBannerProps {
  className?: string;
  maxAlerts?: number;
  onDismiss?: (alertId: string) => void;
}

/**
 * AlertBanner - Displays dashboard alerts
 *
 * Shows active alerts with appropriate styling based on severity.
 * Supports dismissing individual alerts.
 *
 * @example
 * ```tsx
 * <AlertBanner maxAlerts={5} onDismiss={handleDismiss} />
 * ```
 */
export function AlertBanner({
  className = "",
  maxAlerts = 5,
  onDismiss,
}: AlertBannerProps) {
  const { alerts } = useDashboard();

  const getSeverityClass = (severity: Alert["severity"]): string => {
    switch (severity) {
      case "critical":
        return "alert-critical";
      case "warning":
        return "alert-warning";
      case "info":
        return "alert-info";
      default:
        return "";
    }
  };

  const getSeverityIcon = (severity: Alert["severity"]): string => {
    switch (severity) {
      case "critical":
        return "⚠️";
      case "warning":
        return "⚡";
      case "info":
        return "ℹ️";
      default:
        return "📌";
    }
  };

  const displayedAlerts = alerts.slice(0, maxAlerts);
  const remainingCount = alerts.length - maxAlerts;

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div
      className={`alert-banner ${className}`}
      role="region"
      aria-label="Dashboard alerts"
    >
      {displayedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert-item ${getSeverityClass(alert.severity)}`}
          role="alert"
        >
          <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
          <span className="alert-message">{alert.message}</span>
          <span className="alert-time">
            {new Date(alert.triggeredAt).toLocaleTimeString()}
          </span>
          {onDismiss && (
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => onDismiss(alert.id)}
              aria-label="Dismiss alert"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="alert-more">
          <span>+{remainingCount} more alerts</span>
        </div>
      )}
    </div>
  );
}

AlertBanner.displayName = "AlertBanner";
