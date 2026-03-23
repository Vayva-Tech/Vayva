// @ts-nocheck
// ============================================================================
// Industry Core Types
// ============================================================================
// Base type definitions for the industry dashboard engine
// ============================================================================

import type { ReactNode } from "react";
import type { z } from "zod";

// ============================================================================
// Industry Types
// ============================================================================

export type IndustrySlug =
  | "retail"
  | "fashion"
  | "electronics"
  | "beauty"
  | "grocery"
  | "one_product"
  | "food"
  | "services"
  | "b2b"
  | "events"
  | "nightlife"
  | "automotive"
  | "travel_hospitality"
  | "real_estate"
  | "digital"
  | "nonprofit"
  | "education"
  | "blog_media"
  | "analytics"
  | "creative_portfolio"
  | "restaurant"
  | "healthcare";

// ============================================================================
// Widget Types
// ============================================================================

export type WidgetType =
  | "kpi-card"
  | "chart-line"
  | "chart-bar"
  | "chart-pie"
  | "table"
  | "calendar"
  | "map"
  | "kanban"
  | "timeline"
  | "heatmap"
  | "gauge"
  | "list"
  | "custom";

export type DataSourceType =
  | "entity"
  | "analytics"
  | "realtime"
  | "composite"
  | "event"
  | "geo"
  | "static";

export interface DataSourceConfig {
  type: DataSourceType;
  entity?: string;
  query?: string;
  params?: Record<string, unknown>;
  channel?: string;
  queries?: string[];
  filter?: Record<string, unknown>;
  sort?: { field: string; direction: "asc" | "desc" };
  limit?: number;
}

export interface WidgetDefinition {
  id: string;
  type: WidgetType;
  title: string;
  industry: IndustrySlug;
  dataSource: DataSourceConfig;
  refreshInterval?: number;
  permissions?: string[];
  component?: string;
  config?: Record<string, unknown>;
}

// ============================================================================
// Layout Types
// ============================================================================

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface LayoutPreset {
  id: string;
  name: string;
  breakpoints: {
    lg?: LayoutItem[];
    md?: LayoutItem[];
    sm?: LayoutItem[];
    xs?: LayoutItem[];
    xxs?: LayoutItem[];
  };
}

// ============================================================================
// KPI and Alert Types
// ============================================================================

export type KPIFormat = "number" | "currency" | "percent" | "duration" | "list";

export interface KPICardDefinition {
  id: string;
  label: string;
  format: KPIFormat;
  invert?: boolean;
  alertThreshold?: number;
  icon?: string;
  description?: string;
}

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertOperator = "gt" | "lt" | "eq" | "gte" | "lte";

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: AlertOperator;
    value: number;
  };
  severity: AlertSeverity;
  message: string;
  enabled?: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  message: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  data?: Record<string, unknown>;
}

// ============================================================================
// Action Types
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  description?: string;
  permissions?: string[];
}

export interface SuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: AlertSeverity;
  href: string;
  icon: string;
}

// ============================================================================
// Dashboard Configuration Types
// ============================================================================

export type DashboardTimeHorizon = "now" | "today" | "week" | "month";

export type DashboardSectionKey =
  | "primary_object_health"
  | "live_operations"
  | "decision_kpis"
  | "bottlenecks_alerts"
  | "suggested_actions";

export interface DashboardEngineConfig {
  industry: IndustrySlug;
  title: string;
  subtitle: string;
  primaryObjectLabel: string;
  defaultTimeHorizon: DashboardTimeHorizon;
  sections: DashboardSectionKey[];
  widgets: WidgetDefinition[];
  layouts: LayoutPreset[];
  kpiCards: KPICardDefinition[];
  alertRules: AlertRule[];
  actions: QuickAction[];
  failureModes: string[];
}

// ============================================================================
// Widget Data Types
// ============================================================================

export interface WidgetData<T = unknown> {
  widgetId: string;
  data: T;
  cachedAt?: Date;
  expiresAt?: Date;
  error?: string;
}

export interface KPIData {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: "up" | "down" | "neutral";
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  date?: Date;
}

export interface TableColumn {
  key: string;
  label: string;
  format?: KPIFormat;
  sortable?: boolean;
}

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

// ============================================================================
// Engine Types
// ============================================================================

export interface WidgetRegistryEntry {
  type: WidgetType;
  component: React.ComponentType<WidgetProps>;
  schema?: z.ZodSchema;
}

export interface WidgetProps {
  widget: WidgetDefinition;
  data?: WidgetData;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
}

export interface DashboardContextValue {
  industry: IndustrySlug;
  config: DashboardEngineConfig;
  layout: LayoutPreset;
  alerts: Alert[];
  actions: SuggestedAction[];
  isLoading: boolean;
  error?: Error;
  refreshWidget: (widgetId: string) => Promise<void>;
  updateLayout: (layout: LayoutPreset) => Promise<void>;
}

// ============================================================================
// API Types
// ============================================================================

export interface DashboardConfigResponse {
  config: DashboardEngineConfig;
  layout: LayoutPreset;
}

export interface WidgetDataRequest {
  widgetId: string;
  dataSource: DataSourceConfig;
  params?: Record<string, unknown>;
}

export interface WidgetDataResponse<T = unknown> {
  widgetId: string;
  data: T;
  cachedAt: string;
}

export interface AlertResponse {
  alerts: Alert[];
  total: number;
}

export interface UpdateLayoutRequest {
  layout: LayoutPreset;
}

// ============================================================================
// Database Model Types (for Prisma)
// ============================================================================

export interface IndustryDashboardConfigModel {
  id: string;
  storeId: string;
  industry: IndustrySlug;
  layout: LayoutPreset;
  widgets: WidgetDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetInstanceModel {
  id: string;
  dashboardId: string;
  widgetType: WidgetType;
  config: Record<string, unknown>;
  position: LayoutItem;
  dataSource: DataSourceConfig;
}

export interface DashboardAlertModel {
  id: string;
  storeId: string;
  name: string;
  condition: AlertRule["condition"];
  severity: AlertSeverity;
  enabled: boolean;
}

export interface DashboardAlertHistoryModel {
  id: string;
  alertId: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  data?: Record<string, unknown>;
}

export interface IndustryWidgetDataModel {
  id: string;
  widgetId: string;
  data: unknown;
  cachedAt: Date;
  expiresAt: Date;
}
