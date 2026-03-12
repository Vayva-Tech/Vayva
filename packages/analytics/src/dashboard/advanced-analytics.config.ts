/**
 * Advanced Analytics Dashboard Configuration
 * 
 * Cross-industry analytics widgets for comprehensive business intelligence
 */

import type { DashboardEngineConfig, WidgetDefinition } from '@vayva/industry-core';

// ============================================================================
// Predictive Analytics Widgets
// ============================================================================

const REVENUE_FORECAST_WIDGET: WidgetDefinition = {
  id: 'revenue-forecast',
  type: 'chart-line',
  title: 'Revenue Forecast (Next 30 Days)',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'predictive.revenueForecast',
    params: { days: 30 },
  },
  visualization: {
    type: 'line',
    options: {
      currency: true,
      showConfidenceInterval: true,
      confidenceLevel: 0.95,
    },
  },
  refreshInterval: 3600, // 1 hour
};

const DEMAND_PREDICTION_WIDGET: WidgetDefinition = {
  id: 'demand-prediction',
  type: 'chart-area',
  title: 'Demand Prediction',
  industry: 'retail',
  dataSource: {
    type: 'analytics',
    query: 'predictive.demandForecast',
    params: { days: 14 },
  },
  visualization: {
    type: 'area',
    options: {
      showTrend: true,
      showSeasonality: true,
    },
  },
  refreshInterval: 7200, // 2 hours
};

const CHURN_RISK_WIDGET: WidgetDefinition = {
  id: 'churn-risk',
  type: 'table',
  title: 'High Churn Risk Customers',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'predictive.churnRisk',
    params: { threshold: 0.7 },
  },
  visualization: {
    type: 'table',
    options: {
      columns: ['customer', 'riskScore', 'lastActivity', 'recommendedAction'],
      sortable: true,
      highlight: 'riskScore',
    },
  },
  refreshInterval: 1800, // 30 minutes
};

// ============================================================================
// Customer Analytics Widgets
// ============================================================================

const CUSTOMER_LIFETIME_VALUE_WIDGET: WidgetDefinition = {
  id: 'customer-ltv',
  type: 'kpi-card',
  title: 'Average Customer LTV',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'customer.lifetimeValue',
  },
  refreshInterval: 3600,
};

const CUSTOMER_SEGMENTATION_WIDGET: WidgetDefinition = {
  id: 'customer-segmentation',
  type: 'chart-pie',
  title: 'Customer Segments',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'customer.segments',
  },
  visualization: {
    type: 'donut',
    options: {
      showLegend: true,
      showPercentage: true,
    },
  },
  refreshInterval: 7200,
};

const PURCHASE_BEHAVIOR_WIDGET: WidgetDefinition = {
  id: 'purchase-behavior',
  type: 'heatmap',
  title: 'Purchase Behavior Heatmap',
  industry: 'retail',
  dataSource: {
    type: 'analytics',
    query: 'customer.purchaseBehavior',
    params: { timeframe: '30d' },
  },
  visualization: {
    type: 'heatmap',
    options: {
      xAxis: 'hour',
      yAxis: 'dayOfWeek',
      metric: 'purchaseCount',
    },
  },
  refreshInterval: 3600,
};

// ============================================================================
// Revenue Optimization Widgets
// ============================================================================

const MRR_WATERFALL_WIDGET: WidgetDefinition = {
  id: 'mrr-waterfall',
  type: 'chart-bar',
  title: 'MRR Movement Waterfall',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'revenue.mrrWaterfall',
    params: { period: 'month' },
  },
  visualization: {
    type: 'waterfall',
    options: {
      currency: true,
      showNetChange: true,
    },
  },
  refreshInterval: 3600,
};

const PRICING_OPTIMIZATION_WIDGET: WidgetDefinition = {
  id: 'pricing-optimization',
  type: 'custom',
  title: 'Pricing Optimization Recommendations',
  industry: 'retail',
  dataSource: {
    type: 'analytics',
    query: 'revenue.pricingOptimization',
  },
  component: 'PricingOptimization',
  refreshInterval: 7200,
};

const REVENUE_PER_EMPLOYEE_WIDGET: WidgetDefinition = {
  id: 'revenue-per-employee',
  type: 'kpi-card',
  title: 'Revenue Per Employee',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'revenue.perEmployee',
  },
  refreshInterval: 3600,
};

// ============================================================================
// Operational Efficiency Widgets
// ============================================================================

const STAFF_UTILIZATION_WIDGET: WidgetDefinition = {
  id: 'staff-utilization',
  type: 'gauge',
  title: 'Staff Utilization Rate',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'operations.staffUtilization',
  },
  visualization: {
    type: 'gauge',
    options: {
      min: 0,
      max: 100,
      unit: '%',
      thresholds: [60, 80],
    },
  },
  refreshInterval: 1800,
};

const INVENTORY_TURNOVER_WIDGET: WidgetDefinition = {
  id: 'inventory-turnover',
  type: 'kpi-card',
  title: 'Inventory Turnover Ratio',
  industry: 'retail',
  dataSource: {
    type: 'analytics',
    query: 'operations.inventoryTurnover',
  },
  refreshInterval: 3600,
};

const TABLE_TURNOVER_WIDGET: WidgetDefinition = {
  id: 'table-turnover',
  type: 'kpi-card',
  title: 'Table Turnover Rate',
  industry: 'restaurant',
  dataSource: {
    type: 'analytics',
    query: 'operations.tableTurnover',
  },
  refreshInterval: 1800,
};

// ============================================================================
// Competitive Benchmarking Widgets
// ============================================================================

const INDUSTRY_BENCHMARK_WIDGET: WidgetDefinition = {
  id: 'industry-benchmark',
  type: 'radar',
  title: 'Industry Benchmark Comparison',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'benchmark.industryComparison',
  },
  visualization: {
    type: 'radar',
    options: {
      metrics: ['revenue', 'growth', 'efficiency', 'satisfaction', 'profitability'],
      showIndustryAverage: true,
    },
  },
  refreshInterval: 86400, // 24 hours
};

const MARKET_POSITION_WIDGET: WidgetDefinition = {
  id: 'market-position',
  type: 'scatter',
  title: 'Market Position Matrix',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'benchmark.marketPosition',
  },
  visualization: {
    type: 'scatter',
    options: {
      xAxis: 'marketShare',
      yAxis: 'growthRate',
      bubbleSize: 'revenue',
    },
  },
  refreshInterval: 86400,
};

// ============================================================================
// Anomaly Detection Widgets
// ============================================================================

const ANOMALY_ALERTS_WIDGET: WidgetDefinition = {
  id: 'anomaly-alerts',
  type: 'alert-list',
  title: 'Anomaly Alerts',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'anomaly.recentAlerts',
    params: { severity: ['medium', 'high'] },
  },
  visualization: {
    type: 'list',
    options: {
      sortBy: 'severity',
      showTimestamp: true,
      showImpact: true,
    },
  },
  refreshInterval: 300, // 5 minutes
};

const CASH_FLOW_ANOMALY_WIDGET: WidgetDefinition = {
  id: 'cash-flow-anomaly',
  type: 'chart-line',
  title: 'Cash Flow Anomaly Detection',
  industry: 'all',
  dataSource: {
    type: 'analytics',
    query: 'anomaly.cashFlow',
    params: { days: 90 },
  },
  visualization: {
    type: 'line',
    options: {
      showAnomalies: true,
      anomalyColor: '#ef4444',
      currency: true,
    },
  },
  refreshInterval: 3600,
};

// ============================================================================
// Dashboard Layout Configuration
// ============================================================================

export const ADVANCED_ANALYTICS_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'all',
  title: 'Advanced Analytics Platform',
  description: 'Comprehensive business intelligence with predictive analytics and AI-powered insights',
  layout: 'grid',
  widgets: [
    // Row 1: Key Predictive Metrics
    REVENUE_FORECAST_WIDGET,
    CUSTOMER_LIFETIME_VALUE_WIDGET,
    STAFF_UTILIZATION_WIDGET,
    ANOMALY_ALERTS_WIDGET,

    // Row 2: Revenue & Growth
    MRR_WATERFALL_WIDGET,
    DEMAND_PREDICTION_WIDGET,
    PRICING_OPTIMIZATION_WIDGET,

    // Row 3: Customer Insights
    CUSTOMER_SEGMENTATION_WIDGET,
    PURCHASE_BEHAVIOR_WIDGET,
    CHURN_RISK_WIDGET,

    // Row 4: Operational Efficiency
    INVENTORY_TURNOVER_WIDGET,
    TABLE_TURNOVER_WIDGET,
    REVENUE_PER_EMPLOYEE_WIDGET,

    // Row 5: Benchmarking
    INDUSTRY_BENCHMARK_WIDGET,
    MARKET_POSITION_WIDGET,

    // Row 6: Anomaly Detection
    CASH_FLOW_ANOMALY_WIDGET,
  ],
  settings: {
    enablePredictiveAnalytics: true,
    enableAnomalyDetection: true,
    enableBenchmarking: true,
    autoRefresh: true,
    showConfidenceIntervals: true,
  },
};

// Industry-specific preset configurations
export const HEALTHCARE_ANALYTICS_PRESET: DashboardEngineConfig = {
  ...ADVANCED_ANALYTICS_DASHBOARD_CONFIG,
  industry: 'healthcare',
  title: 'Healthcare Analytics',
  widgets: [
    REVENUE_FORECAST_WIDGET,
    STAFF_UTILIZATION_WIDGET,
    ANOMALY_ALERTS_WIDGET,
    CUSTOMER_LIFETIME_VALUE_WIDGET,
    CUSTOMER_SEGMENTATION_WIDGET,
  ],
};

export const RETAIL_ANALYTICS_PRESET: DashboardEngineConfig = {
  ...ADVANCED_ANALYTICS_DASHBOARD_CONFIG,
  industry: 'retail',
  title: 'Retail Analytics',
  widgets: [
    REVENUE_FORECAST_WIDGET,
    DEMAND_PREDICTION_WIDGET,
    CUSTOMER_SEGMENTATION_WIDGET,
    PURCHASE_BEHAVIOR_WIDGET,
    INVENTORY_TURNOVER_WIDGET,
    PRICING_OPTIMIZATION_WIDGET,
    INDUSTRY_BENCHMARK_WIDGET,
  ],
};

export const SAAS_ANALYTICS_PRESET: DashboardEngineConfig = {
  ...ADVANCED_ANALYTICS_DASHBOARD_CONFIG,
  industry: 'saas',
  title: 'SaaS Analytics',
  widgets: [
    MRR_WATERFALL_WIDGET,
    CHURN_RISK_WIDGET,
    CUSTOMER_LIFETIME_VALUE_WIDGET,
    CUSTOMER_SEGMENTATION_WIDGET,
    REVENUE_PER_EMPLOYEE_WIDGET,
    INDUSTRY_BENCHMARK_WIDGET,
    ANOMALY_ALERTS_WIDGET,
  ],
};

export const RESTAURANT_ANALYTICS_PRESET: DashboardEngineConfig = {
  ...ADVANCED_ANALYTICS_DASHBOARD_CONFIG,
  industry: 'restaurant',
  title: 'Restaurant Analytics',
  widgets: [
    REVENUE_FORECAST_WIDGET,
    TABLE_TURNOVER_WIDGET,
    STAFF_UTILIZATION_WIDGET,
    CUSTOMER_SEGMENTATION_WIDGET,
    INVENTORY_TURNOVER_WIDGET,
    ANOMALY_ALERTS_WIDGET,
  ],
};
