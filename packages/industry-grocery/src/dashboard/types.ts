/**
 * Grocery Dashboard Type Definitions
 */

export interface DataSourceConfig {
  type: 'analytics' | 'composite' | 'realtime' | 'event';
  query?: string;
  queries?: string[];
  params?: Record<string, unknown>;
  channel?: string;
  entity?: string;
}

export interface VisualizationConfig {
  type: string;
  options?: Record<string, unknown>;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  breakpoints: {
    lg?: LayoutItem[];
    md?: LayoutItem[];
    sm?: LayoutItem[];
  };
}

export interface KPICardDefinition {
  id: string;
  label: string;
  format: 'percent' | 'currency' | 'number' | 'days';
  invert?: boolean;
  alertThreshold?: number;
}

export interface AlertRule {
  id: string;
  condition: string;
  threshold: number;
  action: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

export interface Permission {
  resource: string;
  action: string;
}

export type WidgetType =
  | 'kpi-card'
  | 'chart-line'
  | 'chart-bar'
  | 'chart-bar-horizontal'
  | 'chart-pie'
  | 'chart-scatter'
  | 'table'
  | 'calendar'
  | 'map'
  | 'kanban'
  | 'timeline'
  | 'heatmap'
  | 'gauge'
  | 'list'
  | 'custom'
  | 'alert-list'
  | 'order-queue'
  | 'metrics-grid'
  | 'promotion-list'
  | 'price-comparison'
  | 'expiration-list'
  | 'delivery-schedule'
  | 'dock-door-status'
  | 'inventory-summary'
  | 'task-manager';

export interface WidgetDefinition {
  id: string;
  type: WidgetType | string;
  title: string;
  industry: string;
  component?: string;
  dataSource: DataSourceConfig;
  visualization?: VisualizationConfig;
  refreshInterval?: number;
  permissions?: Permission[];
  format?: string;
  comparison?: string;
  split?: Record<string, boolean>;
  subtext?: string;
  severity?: string[];
  statuses?: string[];
  metrics?: string[];
  actions?: string[];
  thresholds?: number[];
  invert?: boolean;
  [key: string]: unknown;
}

export interface DashboardEngineConfig {
  industry: string;
  widgets: WidgetDefinition[];
  layouts: LayoutPreset[];
  kpiCards: KPICardDefinition[];
  alertRules: AlertRule[];
  actions: QuickAction[];
}
