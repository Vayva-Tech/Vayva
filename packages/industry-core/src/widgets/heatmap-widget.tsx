// ============================================================================
// Heatmap Widget
// ============================================================================
// Renders a grid-based heatmap for frequency/intensity data
// (e.g. hourly order volumes, site traffic by day-of-week × hour)
// ============================================================================

import { BaseWidget } from "./base-widget";
import type { WidgetProps } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  x: string; // column label (e.g. hour "00"–"23")
  y: string; // row label (e.g. day "Mon"–"Sun")
  value: number;
}

export interface HeatmapData {
  cells: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  minValue?: number;
  maxValue?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface HeatmapWidgetProps extends Omit<WidgetProps, "data"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { widgetId: string; data: HeatmapData; cachedAt?: Date; expiresAt?: Date; error?: string };
}

/**
 * HeatmapWidget – grid visualisation for intensity data.
 *
 * Renders a CSS-grid heatmap where cell opacity is proportional to its
 * value relative to the dataset maximum.  No charting library required.
 */
export function HeatmapWidget({
  widget,
  data,
  isLoading,
  error,
  onRefresh,
}: HeatmapWidgetProps) {
  const heatmapData: HeatmapData = data?.data ?? {
    cells: [],
    xLabels: [],
    yLabels: [],
  };

  const { cells, xLabels, yLabels } = heatmapData;

  const computedMax =
    heatmapData.maxValue ??
    (cells.length > 0 ? Math.max(...cells.map((c) => c.value)) : 1);
  const computedMin = heatmapData.minValue ?? 0;
  const range = computedMax - computedMin || 1;

  // Build a lookup for O(1) cell value access
  const cellMap = new Map<string, number>(
    cells.map((c) => [`${c.y}::${c.x}`, c.value]),
  );

  const intensity = (value: number): number =>
    Math.min(1, Math.max(0, (value - computedMin) / range));

  const formatValue = (value: number): string => {
    const format = widget.config?.format as string | undefined;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value);
      case "percent":
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US").format(value);
    }
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="heatmap-widget"
    >
      {cells.length === 0 ? (
        <p className="heatmap-empty">No data available</p>
      ) : (
        <div className="heatmap-container" role="table" aria-label={widget.title}>
          {/* Column headers */}
          <div
            className="heatmap-header-row"
            style={{
              display: "grid",
              gridTemplateColumns: `auto repeat(${xLabels.length}, 1fr)`,
            }}
          >
            <div className="heatmap-corner" aria-hidden="true" />
            {xLabels.map((x) => (
              <div key={x} className="heatmap-col-label" role="columnheader">
                {x}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {yLabels.map((y) => (
            <div
              key={y}
              className="heatmap-row"
              role="row"
              style={{
                display: "grid",
                gridTemplateColumns: `auto repeat(${xLabels.length}, 1fr)`,
              }}
            >
              <div className="heatmap-row-label" role="rowheader">
                {y}
              </div>
              {xLabels.map((x) => {
                const value = cellMap.get(`${y}::${x}`) ?? 0;
                const alpha = intensity(value);
                return (
                  <div
                    key={x}
                    className="heatmap-cell"
                    role="cell"
                    title={`${y} × ${x}: ${formatValue(value)}`}
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${alpha})`, // indigo-500
                      minHeight: 28,
                    }}
                    aria-label={`${y} ${x}: ${formatValue(value)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
}

HeatmapWidget.displayName = "HeatmapWidget";
