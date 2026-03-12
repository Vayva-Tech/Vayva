import React from 'react';
/**
 * Shared chart styling constants for Recharts components.
 * Centralizes tooltip, axis, and grid styles to ensure visual consistency
 * across all dashboard charts (analytics, reports, dashboard home).
 */

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "14px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

export const CHART_TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 600,
};

export const CHART_TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  marginBottom: 6,
};

export const CHART_AXIS_TICK = {
  fill: "rgba(100,116,139,0.9)",
  fontSize: 11,
};

export const CHART_GRID_STROKE = "rgba(0,0,0,0.06)";
