import type { DashboardEngineConfig } from "@vayva/industry-core";

export const RETAIL_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: "retail",
  title: "Retail command center",
  subtitle: "Inventory, channels, and store performance in one place",
  primaryObjectLabel: "Product",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],
  failureModes: ["pos_offline", "inventory_sync_stale", "payment_provider_degraded"],

  widgets: [
    // Revenue & KPI Widgets
    {
      id: 'revenue',
      type: 'kpi-card',
      title: 'Revenue',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'revenue-total',
        params: { timeframe: '30d' },
      },
      refreshInterval: 300, // 5 minutes
    },
    {
      id: 'orders',
      type: 'kpi-card',
      title: 'Orders',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'orders-total',
        params: { timeframe: '30d' },
      },
      refreshInterval: 300,
    },
    {
      id: 'customers',
      type: 'kpi-card',
      title: 'Customers',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'customers-active',
        params: { timeframe: '30d' },
      },
      refreshInterval: 600,
    },
    {
      id: 'inventory-value',
      type: 'kpi-card',
      title: 'Inventory Value',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'inventory-total-value',
      },
      refreshInterval: 900,
    },
    {
      id: 'conversion-rate',
      type: 'kpi-card',
      title: 'Conversion Rate',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'conversion-rate',
        params: { timeframe: '30d' },
      },
      refreshInterval: 600,
    },

    // Sales by Channel
    {
      id: 'sales-by-channel',
      type: 'chart-donut',
      title: 'Sales by Channel',
      industry: 'retail',
      dataSource: {
        type: 'composite',
        queries: ['channel-sales-breakdown', 'channel-sync-status'],
        params: { timeframe: 'today' },
      },
      visualization: {
        type: 'donut',
        options: {
          showLegend: true,
          showPercentages: true,
        },
      },
      refreshInterval: 300,
    },

    // Store Performance
    {
      id: 'store-performance',
      type: 'chart-bar',
      title: 'Store Performance',
      industry: 'retail',
      dataSource: {
        type: 'composite',
        queries: ['store-revenue', 'store-growth'],
        params: { timeframe: '7d' },
      },
      visualization: {
        type: 'horizontal-bar',
        options: {
          showProgress: true,
          showGrowth: true,
        },
      },
      refreshInterval: 600,
    },

    // Inventory Alerts
    {
      id: 'inventory-alerts',
      type: 'list',
      title: 'Inventory Alerts',
      industry: 'retail',
      dataSource: {
        type: 'entity',
        entity: 'inventory-alert',
        filter: { severity: ['critical', 'warning'] },
      },
      refreshInterval: 300,
    },

    // Top Selling Products
    {
      id: 'top-products',
      type: 'table',
      title: 'Top Selling Products',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'top-products-by-revenue',
        params: { limit: 5, timeframe: 'today' },
      },
      refreshInterval: 600,
    },

    // Recent Orders
    {
      id: 'recent-orders',
      type: 'table',
      title: 'Recent Orders',
      industry: 'retail',
      dataSource: {
        type: 'realtime',
        channel: 'orders-stream',
        entity: 'order',
      },
      refreshInterval: 60, // 1 minute
    },

    // Customer Insights
    {
      id: 'customer-insights',
      type: 'chart-pie',
      title: 'Customer Distribution',
      industry: 'retail',
      dataSource: {
        type: 'analytics',
        query: 'customer-new-vs-returning',
        params: { timeframe: '30d' },
      },
      refreshInterval: 900,
    },

    // Transfers
    {
      id: 'transfers',
      type: 'kanban',
      title: 'Store Transfers',
      industry: 'retail',
      dataSource: {
        type: 'entity',
        entity: 'transfer-request',
        filter: { status: ['requested', 'approved', 'in-transit'] },
      },
      refreshInterval: 300,
    },

    // Tasks
    {
      id: 'tasks',
      type: 'list',
      title: 'Tasks & Reminders',
      industry: 'retail',
      dataSource: {
        type: 'entity',
        entity: 'task',
        filter: { dueDate: 'today', completed: false },
      },
      refreshInterval: 600,
    },

    // AI Insights (Pro Tier)
    {
      id: 'ai-insights',
      type: 'custom',
      title: 'AI Insights',
      industry: 'retail',
      component: 'AIInsightsWidget',
      dataSource: {
        type: 'analytics',
        query: 'ai-demand-forecast',
        params: { horizonDays: 7 },
      },
      refreshInterval: 3600, // 1 hour
      permissions: ["read:ai-insights"],
    },
  ],

  layouts: [
    {
      id: 'retail-default',
      name: 'Retail Standard',
      breakpoints: {
        lg: [
          // Row 1: KPI Cards
          { i: 'revenue', x: 0, y: 0, w: 2.4, h: 4 },
          { i: 'orders', x: 2.4, y: 0, w: 2.4, h: 4 },
          { i: 'customers', x: 4.8, y: 0, w: 2.4, h: 4 },
          { i: 'inventory-value', x: 7.2, y: 0, w: 2.4, h: 4 },
          { i: 'conversion-rate', x: 9.6, y: 0, w: 2.4, h: 4 },
          
          // Row 2: Main Charts
          { i: 'sales-by-channel', x: 0, y: 4, w: 6, h: 6 },
          { i: 'store-performance', x: 6, y: 4, w: 6, h: 6 },
          
          // Row 3: Operations
          { i: 'inventory-alerts', x: 0, y: 10, w: 6, h: 5 },
          { i: 'top-products', x: 6, y: 10, w: 6, h: 5 },
          
          // Row 4: Orders & Customers
          { i: 'recent-orders', x: 0, y: 15, w: 6, h: 5 },
          { i: 'customer-insights', x: 6, y: 15, w: 6, h: 5 },
          
          // Row 5: Transfers & Tasks
          { i: 'transfers', x: 0, y: 20, w: 6, h: 4 },
          { i: 'tasks', x: 6, y: 20, w: 6, h: 4 },
          
          // Row 6: AI Insights (Pro)
          { i: 'ai-insights', x: 0, y: 24, w: 12, h: 4 },
        ],
        md: [
          { i: 'revenue', x: 0, y: 0, w: 4, h: 4 },
          { i: 'orders', x: 4, y: 0, w: 4, h: 4 },
          { i: 'customers', x: 8, y: 0, w: 4, h: 4 },
          { i: 'inventory-value', x: 0, y: 4, w: 6, h: 4 },
          { i: 'conversion-rate', x: 6, y: 4, w: 6, h: 4 },
          { i: 'sales-by-channel', x: 0, y: 8, w: 12, h: 6 },
          { i: 'store-performance', x: 0, y: 14, w: 12, h: 6 },
          { i: 'inventory-alerts', x: 0, y: 20, w: 12, h: 5 },
          { i: 'top-products', x: 0, y: 25, w: 12, h: 5 },
        ],
        sm: [
          { i: 'revenue', x: 0, y: 0, w: 6, h: 4 },
          { i: 'orders', x: 6, y: 0, w: 6, h: 4 },
          { i: 'customers', x: 0, y: 4, w: 6, h: 4 },
          { i: 'inventory-value', x: 6, y: 4, w: 6, h: 4 },
          { i: 'conversion-rate', x: 0, y: 8, w: 12, h: 4 },
          { i: 'sales-by-channel', x: 0, y: 12, w: 12, h: 6 },
          { i: 'store-performance', x: 0, y: 18, w: 12, h: 6 },
        ],
      },
    },
  ],

  kpiCards: [
    { id: 'revenue', label: 'Total Revenue', format: 'currency' },
    { id: 'orders', label: 'Total Orders', format: 'number' },
    { id: 'customers', label: 'Active Customers', format: 'number' },
    { id: 'inventory-value', label: 'Inventory Value', format: 'currency' },
    { id: 'conversion-rate', label: 'Conversion Rate', format: 'percent' },
    { id: 'avg-order-value', label: 'Avg Order Value', format: 'currency' },
    { id: 'sell-through-rate', label: 'Sell-Through Rate', format: 'percent' },
  ],

  alertRules: [
    {
      id: "critical-stock",
      name: "Critical stock",
      condition: { metric: "inventory_level", operator: "lt", value: 0 },
      severity: "critical",
      message: "{productName} is critically low ({currentStock} left)",
      enabled: true,
    },
    {
      id: "low-conversion",
      name: "Low conversion",
      condition: { metric: "conversion_rate", operator: "lt", value: 0.02 },
      severity: "warning",
      message: "Conversion rate dropped to {value}",
      enabled: true,
    },
    {
      id: "store-underperforming",
      name: "Store underperforming",
      condition: { metric: "store_growth", operator: "lt", value: -0.1 },
      severity: "warning",
      message: "{storeName} revenue down {value}",
      enabled: true,
    },
  ],

  actions: [
    {
      id: "create-product",
      label: "Add Product",
      icon: "plus",
      href: "/products/new",
    },
    {
      id: "create-po",
      label: "Create Purchase Order",
      icon: "fileText",
      href: "/inventory/purchase-orders/new",
    },
    {
      id: "transfer-stock",
      label: "Transfer Stock",
      icon: "truck",
      href: "/inventory/transfers/new",
    },
    {
      id: "generate-report",
      label: "Generate Report",
      icon: "barChart",
      href: "/analytics/reports/new",
    },
    {
      id: "manage-loyalty",
      label: "Loyalty Program",
      icon: "users",
      href: "/customers/loyalty",
    },
  ],
};
