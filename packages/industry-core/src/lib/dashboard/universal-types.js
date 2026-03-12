// Universal Dashboard Types

// Universal Dashboard Data
export class UniversalDashboardData {
  constructor(data = {}) {
    this.kpis = data.kpis || new UniversalKpiData();
    this.metrics = data.metrics || new UniversalMetricsData();
    this.overview = data.overview || new UniversalOverviewData();
    this.todosAlerts = data.todosAlerts || new UniversalTodosAlertsData();
    this.activity = data.activity || [];
    this.primaryObjects = data.primaryObjects || { type: "orders", items: [] };
    this.inventoryAlerts = data.inventoryAlerts || null;
  }
}

// Universal KPI Data
export class UniversalKpiData {
  constructor(kpis = {}) {
    this.revenue = kpis.revenue || { value: 0, change: 0, trend: "neutral" };
    this.orders = kpis.orders || { value: 0, change: 0, trend: "neutral" };
    this.customers = kpis.customers || { value: 0, change: 0, trend: "neutral" };
    this.avgOrderValue = kpis.avgOrderValue || { value: 0, change: 0, trend: "neutral" };
  }
}

// Universal Metrics Data
export class UniversalMetricsData {
  constructor(metrics = {}) {
    this.totalRevenue = metrics.totalRevenue || 0;
    this.totalOrders = metrics.totalOrders || 0;
    this.newCustomers = metrics.newCustomers || 0;
    this.returningCustomers = metrics.returningCustomers || 0;
    this.conversionRate = metrics.conversionRate || 0;
    this.averageOrderValue = metrics.averageOrderValue || 0;
  }
}

// Universal Overview Data
export class UniversalOverviewData {
  constructor(overview = {}) {
    this.chartData = overview.chartData || [];
    this.statusCounts = overview.statusCounts || {};
    this.topProducts = overview.topProducts || [];
  }
}

// Universal Todos Alerts Data
export class UniversalTodosAlertsData {
  constructor(todos = {}) {
    this.todos = todos.todos || [];
    this.alerts = todos.alerts || [];
    this.pendingActions = todos.pendingActions || 0;
  }
}

// Universal Activity Item
export class UniversalActivityItem {
  constructor(activity = {}) {
    this.id = activity.id || "";
    this.type = activity.type || "";
    this.description = activity.description || "";
    this.timestamp = activity.timestamp || new Date();
    this.user = activity.user || "";
  }
}

// Universal Primary Object
export class UniversalPrimaryObject {
  constructor(obj = {}) {
    this.id = obj.id || "";
    this.customer = obj.customer || "";
    this.amount = obj.amount || 0;
    this.status = obj.status || "";
    this.createdAt = obj.createdAt || new Date();
  }
}

// Universal Inventory Alerts Data
export class UniversalInventoryAlertsData {
  constructor(alerts = {}) {
    this.lowStockItems = alerts.lowStockItems || [];
    this.outOfStockItems = alerts.outOfStockItems || [];
    this.totalAlerts = alerts.totalAlerts || 0;
  }
}

// Dashboard Time Horizon
export const DashboardTimeHorizon = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "month_to_date",
  "quarter_to_date",
  "year_to_date"
];

// Dashboard Section Key
export const DashboardSectionKey = [
  "overview",
  "sales",
  "inventory",
  "customers",
  "performance",
  "analytics"
];