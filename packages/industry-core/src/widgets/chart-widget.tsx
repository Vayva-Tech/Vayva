// ============================================================================
// Chart Widget
// ============================================================================
// Base chart widget for line, bar, and pie charts
// ============================================================================

import { BaseWidget } from "./base-widget.js";
import type { ChartDataPoint, WidgetData, WidgetProps } from "../types.js";

interface ChartWidgetProps extends Omit<WidgetProps, "data"> {
  data?: WidgetData<ChartDataPoint[]>;
}

/**
 * ChartWidget - Renders different chart types
 *
 * Supports line, bar, and pie chart visualizations.
 * This is a simplified implementation that renders a table
 * representation of the data. In production, this would integrate
 * with a charting library like Recharts or Chart.js.
 */
export function ChartWidget({ widget, data, isLoading, error, onRefresh }: ChartWidgetProps) {
  const chartData: ChartDataPoint[] = data?.data || [];
  const chartType = widget.config?.chartType as string || "bar";

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
      default:
        return new Intl.NumberFormat("en-US").format(value);
    }
  };

  // Simple visualization as a bar representation using divs
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className={`chart-widget chart-${chartType}`}
    >
      <div className="chart-container">
        {chartData.length === 0 ? (
          <p className="chart-empty">No data available</p>
        ) : (
          <div className="chart-data">
            {chartData.map((point, index) => (
              <div key={index} className="chart-row">
                <div className="chart-label">{point.label}</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(point.value / maxValue) * 100}%`,
                    }}
                    title={`${point.label}: ${formatValue(point.value)}`}
                  />
                </div>
                <div className="chart-value">{formatValue(point.value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

ChartWidget.displayName = "ChartWidget";
