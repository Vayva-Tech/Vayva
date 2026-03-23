// @ts-nocheck
// ============================================================================
// Retail Dashboard Configuration
// ============================================================================
// Industry-native dashboard for retail operations
// Primary Object: Product
// Focus: Inventory management, sales tracking, fulfillment
// ============================================================================

import type { DashboardEngineConfig } from "@vayva/industry-core";

export const retailDashboardConfig: DashboardEngineConfig = {
  industry: "retail",
  title: "Retail Operations",
  subtitle: "Move the right inventory without stockouts or dead stock",
  primaryObjectLabel: "Product",
  defaultTimeHorizon: "today",

  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  widgets: [
    // Primary Object Health Widgets
    {
      id: "top-selling-products",
      type: "list",
      title: "Top Selling Today",
      industry: "retail",
      dataSource: {
        type: "entity",
        entity: "Product",
        query: "topSelling",
        params: { limit: 5, timeHorizon: "today" },
      },
      permissions: ["read:products"],
    },
    {
      id: "low-stock-products",
      type: "list",
      title: "Low Stock Alert",
      industry: "retail",
      dataSource: {
        type: "entity",
        entity: "Product",
        query: "lowStock",
        params: { threshold: 10 },
      },
      permissions: ["read:inventory"],
    },
    {
      id: "dead-stock-products",
      type: "list",
      title: "Not Selling (14d)",
      industry: "retail",
      dataSource: {
        type: "entity",
        entity: "Product",
        query: "deadStock",
        params: { days: 14 },
      },
      permissions: ["read:products"],
    },

    // Live Operations Widgets
    {
      id: "pending-fulfillment",
      type: "kpi-card",
      title: "Awaiting Fulfillment",
      industry: "retail",
      dataSource: {
        type: "entity",
        entity: "Order",
        query: "countByStatus",
        params: { status: "pending" },
      },
      permissions: ["read:orders"],
    },
    {
      id: "delayed-shipments",
      type: "kpi-card",
      title: "Shipments Delayed",
      industry: "retail",
      dataSource: {
        type: "entity",
        entity: "Order",
        query: "countByStatus",
        params: { status: "delayed" },
      },
      permissions: ["read:orders"],
    },
    {
      id: "returns-initiated",
      type: "kpi-card",
      title: "Returns Initiated",
      industry: "retail",
      dataSource: {
        type: "entity",
        entity: "Return",
        query: "countToday",
      },
      permissions: ["read:returns"],
    },

    // KPI Cards
    {
      id: "revenue",
      type: "kpi-card",
      title: "Revenue",
      industry: "retail",
      dataSource: {
        type: "analytics",
        query: "revenue",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:analytics"],
    },
    {
      id: "orders",
      type: "kpi-card",
      title: "Orders",
      industry: "retail",
      dataSource: {
        type: "analytics",
        query: "orderCount",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:analytics"],
    },
    {
      id: "customers",
      type: "kpi-card",
      title: "Customers",
      industry: "retail",
      dataSource: {
        type: "analytics",
        query: "customerCount",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:analytics"],
    },
    {
      id: "conversion-rate",
      type: "kpi-card",
      title: "Conversion Rate",
      industry: "retail",
      dataSource: {
        type: "analytics",
        query: "conversionRate",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:analytics"],
    },
  ],

  layouts: [
    {
      id: "retail-default",
      name: "Retail Default",
      breakpoints: {
        lg: [
          { i: "revenue", x: 0, y: 0, w: 3, h: 2 },
          { i: "orders", x: 3, y: 0, w: 3, h: 2 },
          { i: "customers", x: 6, y: 0, w: 3, h: 2 },
          { i: "conversion-rate", x: 9, y: 0, w: 3, h: 2 },
          { i: "top-selling-products", x: 0, y: 2, w: 6, h: 4 },
          { i: "low-stock-products", x: 6, y: 2, w: 6, h: 4 },
          { i: "pending-fulfillment", x: 0, y: 6, w: 4, h: 3 },
          { i: "delayed-shipments", x: 4, y: 6, w: 4, h: 3 },
          { i: "returns-initiated", x: 8, y: 6, w: 4, h: 3 },
        ],
      },
    },
  ],

  kpiCards: [
    {
      id: "revenue",
      label: "Revenue",
      format: "currency",
      icon: "DollarSign",
    },
    {
      id: "orders",
      label: "Orders",
      format: "number",
      icon: "ShoppingCart",
    },
    {
      id: "customers",
      label: "Customers",
      format: "number",
      icon: "Users",
    },
    {
      id: "conversion-rate",
      label: "Conversion Rate",
      format: "percent",
      icon: "TrendingUp",
    },
  ],

  alertRules: [
    {
      id: "low-stock-alert",
      name: "Low Stock Alert",
      condition: {
        metric: "lowStockCount",
        operator: "gte",
        value: 1,
      },
      severity: "warning",
      message: "{count} products below restock threshold",
      enabled: true,
    },
    {
      id: "out-of-stock-alert",
      name: "Out of Stock Alert",
      condition: {
        metric: "outOfStockCount",
        operator: "gte",
        value: 1,
      },
      severity: "critical",
      message: "{count} products out of stock",
      enabled: true,
    },
    {
      id: "delayed-shipment-alert",
      name: "Fulfillment Delays",
      condition: {
        metric: "delayedShipments",
        operator: "gte",
        value: 1,
      },
      severity: "warning",
      message: "{count} shipments delayed",
      enabled: true,
    },
  ],

  actions: [
    {
      id: "restock-low",
      label: "Restock Low Items",
      icon: "PackagePlus",
      href: "/dashboard/products?filter=low_stock",
      description: "Prevent stockouts and lost sales",
      permissions: ["write:inventory"],
    },
    {
      id: "fulfill-pending",
      label: "Process Orders",
      icon: "Truck",
      href: "/dashboard/fulfillment/shipments",
      description: "Customers are waiting",
      permissions: ["write:orders"],
    },
    {
      id: "discount-dead",
      label: "Discount Slow Movers",
      icon: "BadgePercent",
      href: "/dashboard/marketing/discounts",
      description: "Free up capital from dead stock",
      permissions: ["write:marketing"],
    },
  ],

  failureModes: ["Stockouts", "Overstocking", "Margin blindness"],
};
