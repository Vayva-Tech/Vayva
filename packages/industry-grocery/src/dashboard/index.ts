// @ts-nocheck
/**
 * Grocery Industry Dashboard Configuration
 * Complete dashboard layout and widget configuration for grocery stores
 */

import { DashboardEngineConfig } from './types';

export const GROCERY_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'grocery',

  widgets: [
    // Today's Performance
    {
      id: 'sales-today',
      type: 'kpi-card',
      title: 'Sales Today',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'sales-by-date',
        params: { range: 'today' },
      },
      format: 'currency',
      comparison: 'yesterday',
    },
    {
      id: 'transactions-count',
      type: 'kpi-card',
      title: 'Transactions',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'transactions-count',
        params: { range: 'today' },
      },
      format: 'number',
      split: { online: true, inStore: true },
    },
    {
      id: 'average-basket-size',
      type: 'kpi-card',
      title: 'Avg Basket Size',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'average-basket-size',
        params: { range: 'today' },
      },
      format: 'currency',
      comparison: 'last-week',
    },

    // Sales by Department
    {
      id: 'department-performance',
      type: 'chart-bar-horizontal',
      title: 'Sales by Department',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'sales-by-department',
        params: { timeframe: 'today', sortBy: 'revenue' },
      },
    },
    {
      id: 'department-trend',
      type: 'chart-line',
      title: 'Department Sales Trend',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'department-sales-trend',
        params: { timeframe: '7d' },
      },
    },

    // Inventory Alerts
    {
      id: 'stock-alerts',
      type: 'alert-list',
      title: 'Inventory Alerts',
      industry: 'grocery',
      dataSource: {
        type: 'realtime',
        channel: 'inventory-levels',
        entity: 'stock-alert',
      },
      severity: ['critical', 'low'],
    },
    {
      id: 'orders-to-place',
      type: 'kpi-card',
      title: 'Orders to Place',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'pending-purchase-orders',
      },
      format: 'number',
      subtext: 'Estimated Value',
    },

    // Online Orders
    {
      id: 'online-orders-queue',
      type: 'order-queue',
      title: 'Online Orders',
      industry: 'grocery',
      dataSource: {
        type: 'realtime',
        channel: 'online-orders',
        entity: 'order',
      },
      statuses: ['pending', 'preparing', 'ready', 'out-for-delivery'],
    },
    {
      id: 'pickup-schedule',
      type: 'timeline',
      title: 'Pickup Schedule',
      industry: 'grocery',
      dataSource: {
        type: 'event',
        entity: 'pickup-reservation',
      },
    },

    // Customer Insights
    {
      id: 'customer-metrics',
      type: 'metrics-grid',
      title: 'Customer Insights',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'customer-overview',
      },
      metrics: ['total-customers', 'loyalty-members', 'new-this-week', 'returning-rate'],
    },
    {
      id: 'customer-segments',
      type: 'chart-pie',
      title: 'Customer Segments',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'customer-segmentation',
      },
    },
    {
      id: 'spend-by-segment',
      type: 'chart-bar',
      title: 'Avg Spend by Segment',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'average-spend-by-segment',
      },
    },

    // Promotion Performance
    {
      id: 'active-promotions',
      type: 'promotion-list',
      title: 'Active Promotions',
      industry: 'grocery',
      dataSource: {
        type: 'realtime',
        channel: 'promotions',
        entity: 'promotion',
      },
    },
    {
      id: 'promotion-roi',
      type: 'chart-scatter',
      title: 'Promotion ROI',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'promotion-performance',
        params: { metric: 'roi' },
      },
    },
    {
      id: 'digital-coupons',
      type: 'kpi-card',
      title: 'Digital Coupons',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'coupon-redemption',
      },
      format: 'number',
      subtext: 'Redemption Rate',
    },

    // Price Optimization
    {
      id: 'competitor-pricing',
      type: 'price-comparison',
      title: 'Competitor Prices',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'competitor-price-comparison',
      },
    },
    {
      id: 'price-adjustments',
      type: 'table',
      title: 'Price Adjustment Suggestions',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'pricing-recommendations',
      },
      actions: ['approve', 'reject', 'modify'],
    },

    // Expiration Tracking
    {
      id: 'expiring-soon',
      type: 'expiration-list',
      title: 'Expiring Soon',
      industry: 'grocery',
      dataSource: {
        type: 'realtime',
        channel: 'expiration-tracking',
        entity: 'product-batch',
      },
      thresholds: [3, 7], // days
    },
    {
      id: 'waste-reduction',
      type: 'kpi-card',
      title: 'Waste Reduction Savings',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'waste-reduction-savings',
      },
      format: 'currency',
    },

    // Supplier Deliveries
    {
      id: 'incoming-shipments',
      type: 'delivery-schedule',
      title: 'Supplier Deliveries',
      industry: 'grocery',
      dataSource: {
        type: 'event',
        entity: 'supplier-delivery',
      },
    },
    {
      id: 'dock-doors',
      type: 'dock-door-status',
      title: 'Dock Door Assignments',
      industry: 'grocery',
      dataSource: {
        type: 'realtime',
        channel: 'dock-doors',
      },
    },

    // Stock Levels
    {
      id: 'inventory-health',
      type: 'inventory-summary',
      title: 'Stock Levels',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'inventory-health',
      },
    },
    {
      id: 'turnover-rate',
      type: 'kpi-card',
      title: 'Inventory Turnover',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'inventory-turnover-days',
      },
      format: 'days',
    },
    {
      id: 'shrinkage-rate',
      type: 'kpi-card',
      title: 'Shrinkage Rate',
      industry: 'grocery',
      dataSource: {
        type: 'analytics',
        query: 'shrinkage-rate',
      },
      format: 'percent',
      invert: true,
    },

    // Action Required
    {
      id: 'task-list',
      type: 'task-manager',
      title: 'Action Required',
      industry: 'grocery',
      dataSource: {
        type: 'realtime',
        channel: 'tasks',
        entity: 'task',
      },
      priorities: ['high', 'medium', 'low'],
    },
  ],

  layouts: [
    {
      id: 'grocery-default',
      name: 'Grocery Standard',
      breakpoints: {
        lg: [
          // Row 1: Today's Performance
          { i: 'sales-today', x: 0, y: 0, w: 4, h: 3 },
          { i: 'transactions-count', x: 4, y: 0, w: 4, h: 3 },
          { i: 'average-basket-size', x: 8, y: 0, w: 4, h: 3 },

          // Row 2: Department Performance & Inventory Alerts
          { i: 'department-performance', x: 0, y: 3, w: 7, h: 5 },
          { i: 'stock-alerts', x: 7, y: 3, w: 5, h: 5 },

          // Row 3: Online Orders & Customer Insights
          { i: 'online-orders-queue', x: 0, y: 8, w: 6, h: 5 },
          { i: 'customer-metrics', x: 6, y: 8, w: 6, h: 5 },

          // Row 4: Promotions & Price Optimization
          { i: 'active-promotions', x: 0, y: 13, w: 6, h: 5 },
          { i: 'competitor-pricing', x: 6, y: 13, w: 6, h: 5 },

          // Row 5: Expiration Tracking & Supplier Deliveries
          { i: 'expiring-soon', x: 0, y: 18, w: 6, h: 5 },
          { i: 'incoming-shipments', x: 6, y: 18, w: 6, h: 5 },

          // Row 6: Stock Levels & Actions
          { i: 'inventory-health', x: 0, y: 23, w: 6, h: 4 },
          { i: 'task-list', x: 6, y: 23, w: 6, h: 4 },
        ],
      },
    },
  ],

  kpiCards: [
    { id: 'sales-today', label: 'Sales Today', format: 'currency' },
    { id: 'transactions', label: 'Transactions', format: 'number' },
    { id: 'average-basket-size', label: 'Avg Basket Size', format: 'currency' },
    { id: 'loyalty-members', label: 'Loyalty Members', format: 'number' },
    { id: 'inventory-value', label: 'Inventory Value', format: 'currency' },
    { id: 'orders-pending', label: 'Orders Pending', format: 'number' },
    { id: 'shrinkage-rate', label: 'Shrinkage Rate', format: 'percent', invert: true },
    { id: 'turnover-days', label: 'Turnover Days', format: 'days' },
    { id: 'in-stock-rate', label: 'In-Stock Rate', format: 'percent' },
    { id: 'on-time-delivery', label: 'On-Time Delivery', format: 'percent' },
  ],

  alertRules: [
    {
      id: 'critical-low-stock',
      condition: 'stock < threshold * 0.5',
      threshold: 0.5,
      action: 'notify-immediately',
    },
    {
      id: 'expiry-warning',
      condition: 'daysUntilExpiry <= 3',
      threshold: 3,
      action: 'flag-for-review',
    },
    {
      id: 'high-shrinkage',
      condition: 'shrinkageRate > 0.02',
      threshold: 0.02,
      action: 'notify-manager',
    },
    {
      id: 'low-fulfillment-rate',
      condition: 'onTimeFulfillmentRate < 0.90',
      threshold: 0.90,
      action: 'flag-for-review',
    },
  ],

  actions: [
    { id: 'create-po', label: 'Create Purchase Order', icon: 'fileText', action: 'open-po-creator' },
    { id: 'markdown-products', label: 'Mark Down Products', icon: 'tag', action: 'open-markdown-tool' },
    { id: 'manage-promotions', label: 'Manage Promotions', icon: 'percent', action: 'open-promotions' },
    { id: 'schedule-delivery', label: 'Schedule Delivery', icon: 'truck', action: 'open-delivery-scheduler' },
    { id: 'price-check', label: 'Price Check', icon: 'search', action: 'open-price-scanner' },
    { id: 'waste-report', label: 'Log Waste', icon: 'trash2', action: 'open-waste-logger' },
  ],
};
