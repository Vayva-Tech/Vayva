// ============================================================================
// KPI Card Widget
// ============================================================================
// Displays a single KPI metric with trend indicator
// ============================================================================

import { BaseWidget } from "./base-widget.js";
import type { KPIData, WidgetData, WidgetProps } from "../types.js";

interface KPICardWidgetProps extends Omit<WidgetProps, "data"> {
  data?: WidgetData<KPIData>;
}

/**
 * KPICardWidget - Displays a key performance indicator
 *
 * Shows the current value, previous value, change percentage,
 * and trend direction (up/down/neutral).
 */
export function KPICardWidget({ widget, data, isLoading, error, onRefresh }: KPICardWidgetProps) {
  const kpiData: KPIData = data?.data || {
    value: 0,
    previousValue: 0,
    change: 0,
    changePercent: 0,
    trend: "neutral",
  };

  const formatValue = (value: number): string => {
    const format = widget.config?.format as string;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case "percent":
        return `${value.toFixed(1)}%`;
      case "duration":
        return `${Math.floor(value / 60)}m ${value % 60}s`;
      default:
        return new Intl.NumberFormat("en-US").format(value);
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      default:
        return "→";
    }
  };

  const getTrendClass = (trend: string): string => {
    switch (trend) {
      case "up":
        return "trend-up";
      case "down":
        return "trend-down";
      default:
        return "trend-neutral";
    }
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="kpi-card-widget"
    >
      <div className="kpi-card-content">
        <div className="kpi-value">{formatValue(kpiData.value)}</div>

        {kpiData.previousValue !== undefined && (
          <div className={`kpi-trend ${getTrendClass(kpiData.trend || "neutral")}`}>
            <span className="trend-icon">{getTrendIcon(kpiData.trend || "neutral")}</span>
            {kpiData.changePercent !== undefined && (
              <span className="trend-percent">
                {Math.abs(kpiData.changePercent).toFixed(1)}%
              </span>
            )}
          </div>
        )}

        {widget.config?.description && typeof widget.config.description === "string" ? (
          <p className="kpi-description">{widget.config.description}</p>
        ) : null}
      </div>
    </BaseWidget>
  );
}

KPICardWidget.displayName = "KPICardWidget";
