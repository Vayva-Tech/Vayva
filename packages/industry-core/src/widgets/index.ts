// ============================================================================
// Widgets
// ============================================================================
// Widget components and registry for the dashboard engine
// ============================================================================

export { WidgetRegistry } from "./registry.js";
export { BaseWidget } from "./base-widget.js";
export { KPICardWidget } from "./kpi-card.js";
export { ChartWidget } from "./chart-widget.js";
export { TableWidget } from "./table-widget.js";
export { ListWidget } from "./list-widget.js";
export { CustomWidget } from "./custom-widget.js";

// ── Phase 3: New Analytics Widgets ──────────────────────────────────────────
export { HeatmapWidget } from "./heatmap-widget.js";
export type { HeatmapCell, HeatmapData } from "./heatmap-widget.js";

export { GaugeWidget } from "./gauge-widget.js";
export type { GaugeData } from "./gauge-widget.js";

export { SparklineKPICard, CompareKPICard } from "./kpi-card-variants.js";
export type {
  SparklineKPIData,
  ComparePeriod,
  CompareKPIData,
} from "./kpi-card-variants.js";

// ── Tier 1: New Scheduling & Pipeline Widgets ───────────────────────────────
export { CalendarWidget } from "./calendar-widget.js";
export type { CalendarBooking, CalendarWidgetProps } from "./calendar-widget.js";

export { TimelineWidget } from "./timeline-widget.js";
export type { TimelineEvent, TimelineWidgetProps } from "./timeline-widget.js";

export { KanbanWidget } from "./kanban-widget.js";
export type { KanbanCard, KanbanColumn, KanbanWidgetProps } from "./kanban-widget.js";
