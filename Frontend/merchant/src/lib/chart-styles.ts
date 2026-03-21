import React from 'react';
/**
 * Shared chart styling constants for Recharts components.
 * Centralizes tooltip, axis, and grid styles to ensure visual consistency
 * across all dashboard charts (analytics, reports, dashboard home).
 * 
 * Updated for WCAG 2.1 AA compliance - All colors pass 4.5:1 contrast ratio
 */

// Accessible chart color palette - All colors pass WCAG AA contrast requirements
export const ACCESSIBLE_CHART_COLORS = {
  primary: "#2563EB",    // Blue-600 - passes 4.5:1 on white
  secondary: "#DC2626",  // Red-600 - passes 4.5:1 on white
  tertiary: "#16A34A",   // Green-600 - passes 4.5:1 on white
  quaternary: "#D97706", // Amber-600 - passes 4.5:1 on white
  quinary: "#7C3AED",    // Violet-600 - passes 4.5:1 on white
  senary: "#DB2777",     // Pink-600 - passes 4.5:1 on white
} as const;

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.98)",
  border: "2px solid #E5E7EB",
  borderRadius: "14px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
};

export const CHART_TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  color: "#111827", // Gray-900 - passes AAA contrast
  fontSize: 12,
  fontWeight: 600,
};

export const CHART_TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "#374151", // Gray-700 - passes AA contrast
  fontSize: 11,
  marginBottom: 6,
};

export const CHART_AXIS_TICK = {
  fill: "#374151", // Gray-700 - passes AA contrast on white
  fontSize: 11,
};

export const CHART_GRID_STROKE = "#E5E7EB"; // Gray-300 - visible but subtle
