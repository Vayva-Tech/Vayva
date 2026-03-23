// @ts-nocheck
// ============================================================================
// Food/Restaurant Dashboard Configuration
// ============================================================================
// Industry-native dashboard for restaurant/food service
// Primary Object: Menu Item
// Focus: Kitchen operations, order management, table turnover
// ============================================================================

import type { DashboardEngineConfig } from "@vayva/industry-core";

export const foodDashboardConfig: DashboardEngineConfig = {
  industry: "food",
  title: "Kitchen Control",
  subtitle: "Keep prep time low and orders flowing",
  primaryObjectLabel: "Menu Item",
  defaultTimeHorizon: "now",

  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  widgets: [
    // Primary Object Health - Menu Items
    {
      id: "best-selling-items",
      type: "list",
      title: "Best Sellers Today",
      industry: "food",
      dataSource: {
        type: "entity",
        entity: "MenuItem",
        query: "topSelling",
        params: { limit: 5, timeHorizon: "today" },
      },
      permissions: ["read:menu"],
    },
    {
      id: "sold-out-items",
      type: "list",
      title: "Sold Out / Paused",
      industry: "food",
      dataSource: {
        type: "entity",
        entity: "MenuItem",
        query: "unavailable",
        params: {},
      },
      permissions: ["read:menu"],
    },

    // Live Operations - Kitchen Display System (KDS)
    {
      id: "orders-in-queue",
      type: "kpi-card",
      title: "Orders in Queue",
      industry: "food",
      dataSource: {
        type: "realtime",
        channel: "kds:orders",
        query: "countByStatus",
        params: { status: "pending" },
      },
      permissions: ["read:kds"],
    },
    {
      id: "avg-prep-time",
      type: "kpi-card",
      title: "Avg Prep Time",
      industry: "food",
      dataSource: {
        type: "analytics",
        query: "averagePrepTime",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:analytics"],
    },
    {
      id: "kitchen-backlog",
      type: "kpi-card",
      title: "Kitchen Backlog",
      industry: "food",
      dataSource: {
        type: "realtime",
        channel: "kds:orders",
        query: "backlogCount",
      },
      permissions: ["read:kds"],
    },

    // Table Management
    {
      id: "table-turnover",
      type: "kpi-card",
      title: "Table Turnover Rate",
      industry: "food",
      dataSource: {
        type: "analytics",
        query: "tableTurnoverRate",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:tables"],
    },
    {
      id: "occupied-tables",
      type: "kpi-card",
      title: "Occupied Tables",
      industry: "food",
      dataSource: {
        type: "entity",
        entity: "Table",
        query: "countOccupied",
      },
      permissions: ["read:tables"],
    },
  ],

  layouts: [
    {
      id: "food-kds-default",
      name: "Kitchen Display Default",
      breakpoints: {
        lg: [
          { i: "orders-in-queue", x: 0, y: 0, w: 4, h: 2 },
          { i: "avg-prep-time", x: 4, y: 0, w: 4, h: 2 },
          { i: "kitchen-backlog", x: 8, y: 0, w: 4, h: 2 },
          { i: "best-selling-items", x: 0, y: 2, w: 6, h: 4 },
          { i: "sold-out-items", x: 6, y: 2, w: 6, h: 4 },
          { i: "table-turnover", x: 0, y: 6, w: 4, h: 3 },
          { i: "occupied-tables", x: 4, y: 6, w: 4, h: 3 },
        ],
      },
    },
  ],

  kpiCards: [
    {
      id: "orders-today",
      label: "Orders Today",
      format: "number",
      icon: "ClipboardList",
    },
    {
      id: "avg-prep-time",
      label: "Avg Prep Time",
      format: "duration",
      icon: "Timer",
    },
    {
      id: "table-turnover",
      label: "Table Turnover",
      format: "number",
      icon: "RotateCcw",
    },
    {
      id: "revenue",
      label: "Revenue",
      format: "currency",
      icon: "DollarSign",
    },
  ],

  alertRules: [
    {
      id: "prep-time-spike",
      name: "Prep Time Spike",
      condition: {
        metric: "avgPrepTimeMinutes",
        operator: "gte",
        value: 30,
      },
      severity: "critical",
      message: "Average prep time is {value}min — above 30min SLA",
      enabled: true,
    },
    {
      id: "sold-out-alert",
      name: "Sold Out Items",
      condition: {
        metric: "soldOutCount",
        operator: "gte",
        value: 1,
      },
      severity: "warning",
      message: "{count} items sold out",
      enabled: true,
    },
    {
      id: "order-pileup",
      name: "Order Pileup",
      condition: {
        metric: "ordersInQueue",
        operator: "gte",
        value: 10,
      },
      severity: "critical",
      message: "{count} orders queued — kitchen may be overloaded",
      enabled: true,
    },
  ],

  actions: [
    {
      id: "pause-soldout",
      label: "Pause Sold-Out Items",
      icon: "CircleOff",
      href: "/dashboard/menu-items?filter=sold_out",
      description: "Prevent customer disappointment",
      permissions: ["write:menu"],
    },
    {
      id: "clear-backlog",
      label: "Clear Order Backlog",
      icon: "ChefHat",
      href: "/dashboard/kitchen",
      description: "Customers waiting too long",
      permissions: ["write:kds"],
    },
    {
      id: "add-staff",
      label: "Consider Adding Staff",
      icon: "UserPlus",
      href: "/dashboard/settings/profile",
      description: "Prep time exceeding SLA",
      permissions: ["write:staff"],
    },
  ],

  failureModes: ["Kitchen chaos", "Late orders", "Bad customer experience"],
};
