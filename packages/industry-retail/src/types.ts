// Retail Industry Types

export type IndustrySlug = 'retail';

export const RETAIL_INDUSTRY: IndustrySlug = 'retail';

export interface DashboardEngineConfig {
  industry: IndustrySlug;
  widgets: WidgetDefinition[];
  layouts: LayoutPreset[];
  kpiCards: KPICardDefinition[];
  alertRules: AlertRule[];
  actions: QuickAction[];
}

export interface WidgetDefinition {
  id: string;
  type: WidgetType;
  title: string;
  industry: IndustrySlug;
  component?: string;
  dataSource: DataSourceConfig;
  visualization?: VisualizationConfig;
  refreshInterval?: number;
  permissions?: Permission[];
}

export type WidgetType =
  | 'kpi-card'
  | 'chart-line'
  | 'chart-bar'
  | 'chart-pie'
  | 'chart-donut'
  | 'table'
  | 'calendar'
  | 'map'
  | 'kanban'
  | 'timeline'
  | 'heatmap'
  | 'gauge'
  | 'list'
  | 'custom';

export interface DataSourceConfig {
  type: 'analytics' | 'composite' | 'realtime' | 'event' | 'entity';
  query?: string;
  queries?: string[];
  params?: Record<string, unknown>;
  channel?: string;
  entity?: string;
  filter?: Record<string, unknown>;
}

export interface VisualizationConfig {
  type: string;
  options?: Record<string, unknown>;
}

export interface LayoutPreset {
  id: string;
  name: string;
  breakpoints: {
    lg?: LayoutItem[];
    md?: LayoutItem[];
    sm?: LayoutItem[];
    xs?: LayoutItem[];
  };
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KPICardDefinition {
  id: string;
  label: string;
  format: 'percent' | 'currency' | 'number';
  invert?: boolean;
  alertThreshold?: number;
}

export interface AlertRule {
  id: string;
  condition: string;
  threshold: number;
  action: string;
  enabled?: boolean;
  message?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  href?: string;
}

export interface Permission {
  resource: string;
  action: string;
}

// Retail-specific types
export type SalesChannelType = 'online' | 'pos' | 'mobile' | 'marketplace' | 'social';

export interface SalesChannel {
  id: string;
  name: string;
  type: SalesChannelType;
  status: 'active' | 'inactive' | 'syncing';
  lastSync?: string;
  syncStatus: 'success' | 'warning' | 'error' | 'delayed';
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  status: 'open' | 'closed' | 'temporary';
  revenue: number;
  growth: number;
  performancePercent: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  currentStock: number;
  reorderPoint: number;
  severity: 'critical' | 'warning' | 'info';
  action?: 'reorder' | 'transfer' | 'markdown';
}

export interface OrderSummary {
  id: string;
  orderId: string;
  customerName: string;
  customerTier?: string;
  items: number;
  total: number;
  channel: string;
  status: 'processing' | 'completed' | 'cancelled' | 'pending';
  timestamp: string;
}

export interface TransferRequest {
  id: string;
  fromStore: string;
  toStore: string;
  items: number;
  status: 'requested' | 'approved' | 'in-transit' | 'completed' | 'cancelled';
  eta?: string;
}

export interface LoyaltyStats {
  totalMembers: number;
  activeThisMonth: number;
  pointsRedeemed: number;
  newSignups: number;
  tiers: LoyaltyTier[];
}

export interface LoyaltyTier {
  name: string;
  members: number;
  percent: number;
}

export interface CustomerSegment {
  name: string;
  percent: number;
  description?: string;
}

export interface TopProduct {
  rank: number;
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
  growth?: number;
}

export interface ChannelSalesData {
  channel: string;
  percent: number;
  revenue: number;
  orders?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface AIInsight {
  id: string;
  type: 'demand-forecast' | 'inventory-alert' | 'opportunity' | 'risk';
  title: string;
  description: string;
  recommendation: string;
  impact?: string;
  confidence?: number;
}
