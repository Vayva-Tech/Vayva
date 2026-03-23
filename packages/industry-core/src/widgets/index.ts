// @ts-nocheck
// ============================================================================
// Widgets
// ============================================================================
// Widget components and registry for the dashboard engine
// ============================================================================

export { WidgetRegistry } from "./registry";
export { BaseWidget } from "./base-widget";
export { KPICardWidget } from "./kpi-card";
export { ChartWidget } from "./chart-widget";
export { TableWidget } from "./table-widget";
export { ListWidget } from "./list-widget";
export { CustomWidget } from "./custom-widget";

// ── Phase 3: New Analytics Widgets ──────────────────────────────────────────
export { HeatmapWidget } from "./heatmap-widget";
export type { HeatmapCell, HeatmapData } from "./heatmap-widget";

export { GaugeWidget } from "./gauge-widget";
export type { GaugeData } from "./gauge-widget";

export { SparklineKPICard, CompareKPICard } from "./kpi-card-variants";
export type {
  SparklineKPIData,
  ComparePeriod,
  CompareKPIData,
} from "./kpi-card-variants";

// ── Tier 1: New Scheduling & Pipeline Widgets ───────────────────────────────
export { CalendarWidget } from "./calendar-widget";
export type { CalendarBooking, CalendarWidgetProps } from "./calendar-widget";

export { TimelineWidget } from "./timeline-widget";
export type { TimelineEvent, TimelineWidgetProps } from "./timeline-widget";

export { KanbanWidget } from "./kanban-widget";
export type { KanbanCard, KanbanColumn, KanbanWidgetProps } from "./kanban-widget";
