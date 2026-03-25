export type IndustrySlug = 'fashion' | 'restaurant' | 'realestate' | 'healthcare' | 'electronics' | 'beauty' | 'events' | 'b2b' | 'grocery' | 'retail';

export const FASHION_INDUSTRY: IndustrySlug = 'fashion';

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

export interface LayoutPreset {
  id: string;
  name: string;
  breakpoints: {
    lg?: LayoutItem[];
    md?: LayoutItem[];
    sm?: LayoutItem[];
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

// Fashion-specific interfaces from design document
export interface FashionDashboardConfig {
  industry: 'fashion';
  designCategory: 'premium-glass';
  theme: FashionTheme;
  kpis: FashionKPI[];
  sections: FashionSection[];
}

export type FashionTheme = 'rose-gold' | 'champagne' | 'sapphire' | 'emerald' | 'velvet';

export interface FashionKPI {
  id: string;
  name: 'revenue' | 'gmv' | 'orders' | 'customers' | 'conversion';
  value: number;
  change: number;
  sparklineData: number[];
}

export interface FashionSection {
  id: string;
  type: 'size-curve' | 'collection-health' | 'visual-merch' | 'trends' | 'inventory';
  position: 'left' | 'right' | 'full';
  enabled: boolean;
}

// Size Curve Data
export interface SizeCurveData {
  category: string;
  distribution: SizeDistribution[];
  topSize: string;
  restockAlerts: RestockAlert[];
}

export interface SizeDistribution {
  size: string;
  percentage: number;
  units: number;
  revenue: number;
}

export interface RestockAlert {
  size: string;
  currentStock: number;
  threshold: number;
  recommendedOrder: number;
}

// Collection Data
export interface CollectionHealth {
  id: string;
  name: string;
  gmv: number;
  units: number;
  performance: number; // 0-100
  imageUrl: string;
}

// Lookbook
export interface Lookbook {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  conversion: number;
  images: string[];
  createdAt: Date;
}

// Trend Data
export interface TrendData {
  name: string;
  growth: number;
  category: string;
  confidence: number;
}

// Inventory Heatmap
export interface InventoryVariant {
  size: string;
  color: string;
  quantity: number;
  status: 'healthy' | 'low' | 'critical';
}
