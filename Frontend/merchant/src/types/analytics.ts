export interface ChartDataItem {
  date: string;
  sales: number;
  orders: number;
}

export interface OverviewMetrics {
  totalSales: number;
  totalOrders: number;
  aov: number;
  activeCustomers: number;
  chartData: ChartDataItem[];
}

export interface AnalyticInsight {
  id: string;
  type: "positive" | "warning" | "negative" | "neutral";
  message: string;
  action?: string;
}

export interface Recommendation {
  reason: string;
  potential_uplift: {
    orders: number;
  };
}

export interface ActivePerformance {
  health_score: number;
  metrics: {
    conversion_rate: number;
    revenue: number;
    orders: number;
    aov?: number;
  };
  delta: {
    conversion_rate: number;
    revenue: number;
    orders: number;
    aov?: number;
  };
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface TopProduct {
  template_id: string;
  name: string;
  best_for: string;
  conversion_rate: number;
  revenue: number;
  is_active: boolean;
  plan_required?: string;
}

export interface ComparisonData {
  template_id: string;
  name: string;
  best_for: string;
  conversion_rate: number;
  revenue: number;
  is_active: boolean;
  plan_required?: string;
}

export interface AnalyticsData extends OverviewMetrics {}

export interface Insight extends AnalyticInsight {}

export interface AnalyticsInsightsResponse {
  insights: AnalyticInsight[];
}
