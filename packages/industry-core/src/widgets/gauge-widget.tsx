// ============================================================================
// Gauge Widget
// ============================================================================
// SVG arc-based gauge for single metric values (0–100 by default)
// Great for: conversion rate, capacity utilisation, NPS, satisfaction score
// ============================================================================

import { BaseWidget } from "./base-widget";
import type { WidgetProps } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GaugeData {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  target?: number; // optional target line
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a value within [min, max] to an SVG arc path. */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// ─── Component ───────────────────────────────────────────────────────────────

const START_DEG = 210; // bottom-left
const END_DEG = 330; // bottom-right (full arc = 300°)

interface GaugeWidgetProps extends Omit<WidgetProps, "data"> {
  data?: {
    widgetId: string;
    data: GaugeData;
    cachedAt?: Date;
    expiresAt?: Date;
    error?: string;
  };
}

/**
 * GaugeWidget – SVG half-arc gauge.
 *
 * Renders a 300° arc gauge with track + fill arcs, a needle, and a
 * centred value label.  Entirely dependency-free.
 */
export function GaugeWidget({
  widget,
  data,
  isLoading,
  error,
  onRefresh,
}: GaugeWidgetProps) {
  const gaugeData: GaugeData = data?.data ?? { value: 0, min: 0, max: 100 };

  const min = gaugeData.min ?? 0;
  const max = gaugeData.max ?? 100;
  const value = clamp(gaugeData.value, min, max);
  const ratio = max > min ? (value - min) / (max - min) : 0;

  // Arc goes from START_DEG to END_DEG, 300° total
  const arcSpan = END_DEG + 360 - START_DEG; // 300 degrees
  const fillEndDeg = START_DEG + arcSpan * ratio;

  const cx = 100;
  const cy = 100;
  const r = 72;

  const trackPath = describeArc(cx, cy, r, START_DEG, END_DEG + 360 - 0.01); // near-full arc
  const fillPath =
    ratio > 0
      ? describeArc(cx, cy, r, START_DEG, clamp(fillEndDeg, START_DEG, END_DEG + 360 - 0.01))
      : null;

  const formatValue = (v: number): string => {
    const format = widget.config?.format as string | undefined;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(v);
      case "percent":
        return `${v.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(v);
    }
  };

  // Colour zones: green ≥ 70%, amber 40–70%, red < 40%
  const fillColour = ratio >= 0.7 ? "#22c55e" : ratio >= 0.4 ? "#f59e0b" : "#ef4444";

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="gauge-widget"
    >
      <div className="gauge-container" style={{ textAlign: "center" }}>
        <svg
          viewBox="0 0 200 160"
          aria-label={`${widget.title}: ${formatValue(value)}`}
          role="img"
          style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto" }}
        >
          {/* Track (background arc) */}
          <path
            d={trackPath}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={14}
            strokeLinecap="round"
          />

          {/* Fill (value arc) */}
          {fillPath && (
            <path
              d={fillPath}
              fill="none"
              stroke={fillColour}
              strokeWidth={14}
              strokeLinecap="round"
            />
          )}

          {/* Target marker */}
          {gaugeData.target !== undefined && (() => {
            const targetRatio = clamp((gaugeData.target - min) / (max - min || 1), 0, 1);
            const targetDeg = START_DEG + arcSpan * targetRatio;
            const toRad = (d: number) => (d * Math.PI) / 180;
            const tx = cx + r * Math.cos(toRad(targetDeg));
            const ty = cy + r * Math.sin(toRad(targetDeg));
            return (
              <circle
                cx={tx}
                cy={ty}
                r={5}
                fill="#6366f1"
                aria-label={`Target: ${formatValue(gaugeData.target!)}`}
              />
            );
          })()}

          {/* Centre value */}
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize={22}
            fontWeight={700}
            fill="currentColor"
            className="gauge-value-text"
          >
            {formatValue(value)}
          </text>

          {/* Optional sub-label */}
          {gaugeData.label && (
            <text
              x={cx}
              y={cy + 30}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
              className="gauge-label-text"
            >
              {gaugeData.label}
            </text>
          )}

          {/* Min / Max tick labels */}
          <text x={28} y={148} fontSize={9} fill="#9ca3af" textAnchor="middle">
            {min}
          </text>
          <text x={172} y={148} fontSize={9} fill="#9ca3af" textAnchor="middle">
            {max}
          </text>
        </svg>
      </div>
    </BaseWidget>
  );
}

GaugeWidget.displayName = "GaugeWidget";
