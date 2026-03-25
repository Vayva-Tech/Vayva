import type { DashboardEngineConfig } from "@vayva/industry-core";

export const FASHION_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: "fashion",
  title: "Fashion operations",
  subtitle: "Collections, size curves, and wholesale in one view",
  primaryObjectLabel: "SKU",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],
  failureModes: ["wholesale_sync_stale", "inventory_feed_delayed", "returns_pipeline_blocked"],

  widgets: [
    {
      id: 'visual-merchandising',
      type: 'custom',
      title: 'Visual Merchandising Board',
      industry: 'fashion',
      component: 'VisualMerchandisingWidget',
      dataSource: {
        type: 'composite',
        queries: ['products', 'collections', 'lookbooks'],
      },
    },
    {
      id: 'size-curve',
      type: 'chart-bar',
      title: 'Size Curve Analysis',
      industry: 'fashion',
      dataSource: {
        type: 'analytics',
        query: 'size-distribution-by-category',
        params: { timeframe: '30d' },
      },
    },
    {
      id: 'collection-health',
      type: 'heatmap',
      title: 'Collection Health Matrix',
      industry: 'fashion',
      dataSource: {
        type: 'composite',
        queries: ['inventory-by-collection', 'sales-velocity'],
      },
    },
    {
      id: 'return-analysis',
      type: 'chart-pie',
      title: 'Return Reasons',
      industry: 'fashion',
      dataSource: {
        type: 'analytics',
        query: 'return-reasons-breakdown',
      },
    },
    {
      id: 'drop-calendar',
      type: 'calendar',
      title: 'Collection Drops',
      industry: 'fashion',
      dataSource: {
        type: 'event',
        entity: 'collection-release',
      },
    },
    {
      id: 'wholesale-status',
      type: 'kpi-card',
      title: 'B2B Orders Pending',
      industry: 'fashion',
      dataSource: {
        type: 'realtime',
        channel: 'wholesale-orders',
      },
    },
    // Phase 4: Demand Forecasting Widgets
    {
      id: 'demand-forecast-30d',
      type: 'chart-line',
      title: '30-Day Demand Forecast',
      industry: 'fashion',
      dataSource: {
        type: 'analytics',
        query: 'demand-forecast',
        params: { horizonDays: 30, includeSeasonality: true },
      },
      refreshInterval: 3600, // 1 hour
    },
    {
      id: 'size-curve-health',
      type: 'gauge',
      title: 'Size Curve Health Score',
      industry: 'fashion',
      dataSource: {
        type: 'analytics',
        query: 'size-curve-health-score',
      },
      refreshInterval: 7200,
    },
    {
      id: 'auto-replenishment-queue',
      type: 'table',
      title: 'Auto-Replenishment Queue',
      industry: 'fashion',
      dataSource: {
        type: 'realtime',
        channel: 'replenishment-triggers',
        entity: 'auto-replenishment-rule',
      },
    },
    {
      id: 'stockout-risk-map',
      type: 'heatmap',
      title: 'Stockout Risk by Size × Product',
      industry: 'fashion',
      dataSource: {
        type: 'composite',
        queries: ['size-curve-optimizer', 'inventory-levels'],
        params: { horizonDays: 30 },
      },
      refreshInterval: 1800,
    },
    {
      id: 'seasonality-calendar',
      type: 'calendar',
      title: 'Seasonal Demand Events',
      industry: 'fashion',
      dataSource: {
        type: 'event',
        entity: 'seasonality-pattern',
      },
    },
  ],

  layouts: [
    {
      id: 'fashion-default',
      name: 'Fashion Standard',
      breakpoints: {
        lg: [
          { i: 'visual-merchandising', x: 0, y: 0, w: 8, h: 6 },
          { i: 'size-curve', x: 8, y: 0, w: 4, h: 6 },
          { i: 'collection-health', x: 0, y: 6, w: 6, h: 5 },
          { i: 'return-analysis', x: 6, y: 6, w: 3, h: 5 },
          { i: 'drop-calendar', x: 9, y: 6, w: 3, h: 5 },
          { i: 'wholesale-status', x: 0, y: 11, w: 12, h: 2 },
          // Phase 4 demand forecasting layout
          { i: 'demand-forecast-30d', x: 0, y: 13, w: 8, h: 5 },
          { i: 'size-curve-health', x: 8, y: 13, w: 4, h: 5 },
          { i: 'stockout-risk-map', x: 0, y: 18, w: 6, h: 5 },
          { i: 'auto-replenishment-queue', x: 6, y: 18, w: 6, h: 5 },
          { i: 'seasonality-calendar', x: 0, y: 23, w: 12, h: 4 },
        ],
      },
    },
  ],

  kpiCards: [
    { id: 'revenue', label: 'Revenue', format: 'currency' },
    { id: 'gmv', label: 'GMV', format: 'currency' },
    { id: 'orders', label: 'Orders', format: 'number' },
    { id: 'customers', label: 'Customers', format: 'number' },
    { id: 'conversion', label: 'Conversion', format: 'percent' },
    { id: 'sell-through-rate', label: 'Sell-Through Rate', format: 'percent' },
    { id: 'avg-basket-size', label: 'Avg Basket Size', format: 'currency' },
    { id: 'return-rate', label: 'Return Rate', format: 'percent', invert: true },
    { id: 'size-stockout-risk', label: 'Size Stockout Risk', format: 'number', alertThreshold: 5 },
    // Phase 4: Demand forecasting KPIs
    { id: 'forecast-accuracy', label: 'Forecast Accuracy', format: 'percent' },
    { id: 'replenishment-coverage', label: 'Replenishment Coverage', format: 'percent' },
    { id: 'size-curve-health-score', label: 'Size Curve Health', format: 'number', alertThreshold: 70 },
  ],

  alertRules: [
    {
      id: "low-sell-through",
      name: "Low sell-through",
      condition: { metric: "sell_through_rate", operator: "lt", value: 0.3 },
      severity: "warning",
      message: "Sell-through dropped below target",
      enabled: true,
    },
    {
      id: "high-return-rate",
      name: "High return rate",
      condition: { metric: "return_rate", operator: "gt", value: 0.15 },
      severity: "warning",
      message: "Return rate elevated — review assortment",
      enabled: true,
    },
  ],

  actions: [
    { id: "create-lookbook", label: "Create Lookbook", icon: "images", href: "/merchandising/lookbooks/new" },
    { id: "manage-wholesale", label: "Wholesale Portal", icon: "users", href: "/wholesale" },
    { id: "size-analysis", label: "Size Analysis", icon: "barChart", href: "/analytics/sizes" },
    {
      id: "run-forecast",
      label: "Run Forecast",
      icon: "trendingUp",
      href: "/analytics/demand-forecast",
    },
    {
      id: "optimize-size-curve",
      label: "Optimize Sizes",
      icon: "sliders",
      href: "/inventory/size-curve",
    },
    {
      id: "manage-replenishment",
      label: "Auto-Replenishment",
      icon: "refreshCw",
      href: "/inventory/replenishment",
    },
  ],
};
