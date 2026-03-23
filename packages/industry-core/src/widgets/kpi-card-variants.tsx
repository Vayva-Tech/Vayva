// @ts-nocheck
// ============================================================================
// KPI Card Variations
// ============================================================================
// SparklineKPICard – KPI metric + inline sparkline (SVG polyline)
// CompareKPICard   – side-by-side period comparison (current vs previous)
// ============================================================================

import { BaseWidget } from "./base-widget";
import type { KPIData, WidgetProps } from "../types";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function formatKPIValue(value: number, format: string | undefined): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "duration":
      return `${Math.floor(value / 60)}m ${Math.round(value % 60)}s`;
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
}

function trendClass(trend?: string): string {
  if (trend === "up") return "trend-up";
  if (trend === "down") return "trend-down";
  return "trend-neutral";
}

function trendIcon(trend?: string): string {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

// ─── Sparkline helpers ───────────────────────────────────────────────────────

function buildPolylinePoints(series: number[], width = 80, height = 28): string {
  if (series.length < 2) return "";
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const step = width / (series.length - 1);
  return series
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// ─── SparklineKPICard ────────────────────────────────────────────────────────

export interface SparklineKPIData extends KPIData {
  series: number[]; // ordered data points for the sparkline
}

interface SparklineKPICardProps extends Omit<WidgetProps, "data"> {
  data?: {
    widgetId: string;
    data: SparklineKPIData;
    cachedAt?: Date;
    expiresAt?: Date;
    error?: string;
  };
}

/**
 * SparklineKPICard – KPI metric with an inline SVG sparkline trend.
 *
 * Shows the current value, change %, trend direction, and a small
 * polyline sparkline to visualise recent history at a glance.
 */
export function SparklineKPICard({
  widget,
  data,
  isLoading,
  error,
  onRefresh,
}: SparklineKPICardProps) {
  const kpi: SparklineKPIData = data?.data ?? {
    value: 0,
    trend: "neutral",
    series: [],
  };

  const format = widget.config?.format as string | undefined;
  const points = buildPolylinePoints(kpi.series);
  const sparkColour = kpi.trend === "up" ? "#22c55e" : kpi.trend === "down" ? "#ef4444" : "#6366f1";

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="sparkline-kpi-card"
    >
      <div className="sparkline-kpi-content" style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        {/* Left: value + trend */}
        <div className="sparkline-kpi-values" style={{ flex: 1 }}>
          <div className="kpi-value" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {formatKPIValue(kpi.value, format)}
          </div>
          {kpi.changePercent !== undefined && (
            <div className={`kpi-trend ${trendClass(kpi.trend)}`} style={{ fontSize: "0.75rem" }}>
              <span>{trendIcon(kpi.trend)}</span>{" "}
              <span>{Math.abs(kpi.changePercent).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Right: sparkline */}
        {kpi.series.length >= 2 && (
          <svg
            viewBox="0 0 80 28"
            width={80}
            height={28}
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <polyline
              points={points}
              fill="none"
              stroke={sparkColour}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </BaseWidget>
  );
}

SparklineKPICard.displayName = "SparklineKPICard";

// ─── CompareKPICard ──────────────────────────────────────────────────────────

export interface ComparePeriod {
  label: string; // e.g. "This month", "Last month"
  value: number;
}

export interface CompareKPIData {
  periods: [ComparePeriod, ComparePeriod]; // exactly two periods
  unit?: string;
}

interface CompareKPICardProps extends Omit<WidgetProps, "data"> {
  data?: {
    widgetId: string;
    data: CompareKPIData;
    cachedAt?: Date;
    expiresAt?: Date;
    error?: string;
  };
}

/**
 * CompareKPICard – side-by-side comparison of two time periods.
 *
 * Renders two value columns (e.g. "This month" vs "Last month") with
 * a delta % indicator between them.
 */
export function CompareKPICard({
  widget,
  data,
  isLoading,
  error,
  onRefresh,
}: CompareKPICardProps) {
  const compareData: CompareKPIData = data?.data ?? {
    periods: [
      { label: "Current", value: 0 },
      { label: "Previous", value: 0 },
    ],
  };

  const format = widget.config?.format as string | undefined;
  const [current, previous] = compareData.periods;

  const delta =
    previous.value !== 0
      ? ((current.value - previous.value) / Math.abs(previous.value)) * 100
      : 0;

  const trend: "up" | "down" | "neutral" =
    delta > 0 ? "up" : delta < 0 ? "down" : "neutral";

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="compare-kpi-card"
    >
      <div
        className="compare-kpi-content"
        style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}
      >
        {/* Current period */}
        <div className="compare-period compare-current" style={{ textAlign: "left" }}>
          <div className="compare-label" style={{ fontSize: "0.7rem", color: "#6b7280" }}>
            {current.label}
          </div>
          <div className="compare-value" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {formatKPIValue(current.value, format)}
          </div>
        </div>

        {/* Delta */}
        <div className={`compare-delta ${trendClass(trend)}`} style={{ textAlign: "center", fontSize: "0.85rem" }}>
          <div>{trendIcon(trend)}</div>
          <div>{Math.abs(delta).toFixed(1)}%</div>
        </div>

        {/* Previous period */}
        <div className="compare-period compare-previous" style={{ textAlign: "right" }}>
          <div className="compare-label" style={{ fontSize: "0.7rem", color: "#6b7280" }}>
            {previous.label}
          </div>
          <div className="compare-value" style={{ fontSize: "1.25rem", fontWeight: 700, color: "#9ca3af" }}>
            {formatKPIValue(previous.value, format)}
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}

CompareKPICard.displayName = "CompareKPICard";
