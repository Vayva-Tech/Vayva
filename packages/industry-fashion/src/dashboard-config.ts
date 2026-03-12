import { DashboardEngineConfig } from './types';

export const FASHION_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'fashion',

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
      id: 'low-sell-through',
      condition: 'sell-through-rate < 0.3',
      threshold: 0.3,
      action: 'notify-merchant',
    },
    {
      id: 'high-return-rate',
      condition: 'return-rate > 0.15',
      threshold: 0.15,
      action: 'flag-products',
    },
  ],

  actions: [
    { id: 'create-lookbook', label: 'Create Lookbook', icon: 'images', action: 'open-lookbook-creator' },
    { id: 'manage-wholesale', label: 'Wholesale Portal', icon: 'users', action: 'open-wholesale-dashboard' },
    { id: 'size-analysis', label: 'Size Analysis', icon: 'barChart', action: 'open-size-analytics' },
    // Phase 4: Demand forecasting actions
    { id: 'run-forecast', label: 'Run Forecast', icon: 'trendingUp', action: 'trigger-demand-forecast' },
    { id: 'optimize-size-curve', label: 'Optimize Sizes', icon: 'sliders', action: 'open-size-optimizer' },
    { id: 'manage-replenishment', label: 'Auto-Replenishment', icon: 'refreshCw', action: 'open-replenishment-rules' },
  ],
};
