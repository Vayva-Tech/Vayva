import type { DashboardEngineConfig, WidgetDefinition } from '../types';

const TOTAL_INVENTORY: WidgetDefinition = {
  id: 'total-inventory',
  type: 'kpi-card',
  title: 'Total Inventory',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'vehicles.total' },
  refreshInterval: 300,
};

const VEHICLES_SOLD: WidgetDefinition = {
  id: 'vehicles-sold',
  type: 'kpi-card',
  title: 'Sold This Month',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'vehicles.soldThisMonth' },
  refreshInterval: 300,
};

const MONTHLY_REVENUE: WidgetDefinition = {
  id: 'monthly-revenue',
  type: 'kpi-card',
  title: 'Monthly Revenue',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'revenue.thisMonth' },
  refreshInterval: 300,
};

const TEST_DRIVE_CONVERSION: WidgetDefinition = {
  id: 'test-drive-conversion',
  type: 'gauge',
  title: 'Test Drive Conversion',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'testDrives.conversionRate' },
  visualization: { type: 'gauge', options: { min: 0, max: 100, unit: '%' } },
  refreshInterval: 3600,
};

const REVENUE_TREND: WidgetDefinition = {
  id: 'revenue-trend',
  type: 'chart-line',
  title: 'Revenue Trend',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'revenue.monthly' },
  visualization: { type: 'line', options: { currency: true } },
  refreshInterval: 3600,
};

const TOP_SELLING_MAKES: WidgetDefinition = {
  id: 'top-makes',
  type: 'chart-bar',
  title: 'Top Selling Makes',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'vehicles.topMakes' },
  visualization: { type: 'bar' },
  refreshInterval: 3600,
};

const INVENTORY_BY_CONDITION: WidgetDefinition = {
  id: 'inventory-condition',
  type: 'chart-pie',
  title: 'Inventory by Condition',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'vehicles.byCondition' },
  visualization: { type: 'donut' },
  refreshInterval: 3600,
};

const TODAYS_SCHEDULE: WidgetDefinition = {
  id: 'todays-schedule',
  type: 'table',
  title: "Today's Schedule",
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'schedule.today' },
  refreshInterval: 60,
};

// New Enhanced Widgets
const SERVICE_APPOINTMENTS: WidgetDefinition = {
  id: 'service-appointments',
  type: 'kpi-card',
  title: 'Service Appts Today',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'service.appointmentsToday' },
  refreshInterval: 300,
};

const FINANCING_APPLICATIONS: WidgetDefinition = {
  id: 'financing-applications',
  type: 'kpi-card',
  title: 'Pending Finances',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'financing.pending' },
  refreshInterval: 600,
};

const TRADE_IN_EVALUATIONS: WidgetDefinition = {
  id: 'trade-in-evaluations',
  type: 'table',
  title: 'Recent Trade-Ins',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'tradeIns.recent' },
  refreshInterval: 1800,
};

const SALES_FORECAST: WidgetDefinition = {
  id: 'sales-forecast',
  type: 'chart-line',
  title: 'Sales Forecast',
  industry: 'automotive',
  dataSource: { type: 'analytics', query: 'sales.forecast' },
  visualization: { type: 'line', options: { currency: true } },
  refreshInterval: 3600,
};

export const AUTOMOTIVE_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'automotive',
  widgets: [
    TOTAL_INVENTORY, VEHICLES_SOLD, MONTHLY_REVENUE, TEST_DRIVE_CONVERSION,
    REVENUE_TREND, TOP_SELLING_MAKES, INVENTORY_BY_CONDITION, TODAYS_SCHEDULE,
    SERVICE_APPOINTMENTS, FINANCING_APPLICATIONS, TRADE_IN_EVALUATIONS, SALES_FORECAST,
  ],
  layouts: [
    {
      id: 'default',
      name: 'Dealership Overview',
      breakpoints: {
        lg: [
          { i: 'total-inventory', x: 0, y: 0, w: 2, h: 2 },
          { i: 'vehicles-sold', x: 2, y: 0, w: 2, h: 2 },
          { i: 'monthly-revenue', x: 4, y: 0, w: 2, h: 2 },
          { i: 'test-drive-conversion', x: 6, y: 0, w: 2, h: 2 },
          { i: 'service-appointments', x: 8, y: 0, w: 2, h: 2 },
          { i: 'financing-applications', x: 10, y: 0, w: 2, h: 2 },
          { i: 'revenue-trend', x: 0, y: 2, w: 8, h: 4 },
          { i: 'inventory-condition', x: 8, y: 2, w: 4, h: 4 },
          { i: 'top-makes', x: 0, y: 6, w: 4, h: 4 },
          { i: 'sales-forecast', x: 4, y: 6, w: 4, h: 4 },
          { i: 'todays-schedule', x: 8, y: 6, w: 4, h: 4 },
          { i: 'trade-in-evaluations', x: 0, y: 10, w: 12, h: 3 },
        ],
        md: [
          { i: 'total-inventory', x: 0, y: 0, w: 3, h: 2 },
          { i: 'vehicles-sold', x: 3, y: 0, w: 3, h: 2 },
          { i: 'monthly-revenue', x: 6, y: 0, w: 3, h: 2 },
          { i: 'test-drive-conversion', x: 9, y: 0, w: 3, h: 2 },
          { i: 'service-appointments', x: 0, y: 2, w: 3, h: 2 },
          { i: 'financing-applications', x: 3, y: 2, w: 3, h: 2 },
          { i: 'revenue-trend', x: 0, y: 4, w: 12, h: 4 },
          { i: 'inventory-condition', x: 0, y: 8, w: 6, h: 4 },
          { i: 'top-makes', x: 6, y: 8, w: 6, h: 4 },
          { i: 'sales-forecast', x: 0, y: 12, w: 12, h: 4 },
          { i: 'todays-schedule', x: 0, y: 16, w: 12, h: 4 },
          { i: 'trade-in-evaluations', x: 0, y: 20, w: 12, h: 3 },
        ],
      },
    },
    {
      id: 'sales-manager',
      name: 'Sales Manager Dashboard',
      breakpoints: {
        lg: [
          { i: 'vehicles-sold', x: 0, y: 0, w: 3, h: 2 },
          { i: 'monthly-revenue', x: 3, y: 0, w: 3, h: 2 },
          { i: 'test-drive-conversion', x: 6, y: 0, w: 3, h: 2 },
          { i: 'financing-applications', x: 9, y: 0, w: 3, h: 2 },
          { i: 'revenue-trend', x: 0, y: 2, w: 8, h: 4 },
          { i: 'top-makes', x: 8, y: 2, w: 4, h: 4 },
          { i: 'sales-forecast', x: 0, y: 6, w: 12, h: 4 },
          { i: 'todays-schedule', x: 0, y: 10, w: 12, h: 4 },
        ],
      },
    },
    {
      id: 'service-manager',
      name: 'Service Manager Dashboard',
      breakpoints: {
        lg: [
          { i: 'service-appointments', x: 0, y: 0, w: 4, h: 2 },
          { i: 'monthly-revenue', x: 4, y: 0, w: 4, h: 2 },
          { i: 'todays-schedule', x: 8, y: 0, w: 4, h: 2 },
          { i: 'trade-in-evaluations', x: 0, y: 2, w: 12, h: 4 },
          { i: 'revenue-trend', x: 0, y: 6, w: 12, h: 4 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'total-inventory', label: 'Total Inventory', format: 'number' },
    { id: 'vehicles-sold', label: 'Sold This Month', format: 'number' },
    { id: 'monthly-revenue', label: 'Monthly Revenue', format: 'currency' },
    { id: 'test-drive-conversion', label: 'Test Drive Conversion', format: 'percent' },
    { id: 'service-appointments', label: 'Service Appointments', format: 'number' },
    { id: 'financing-applications', label: 'Pending Finances', format: 'number' },
  ],
  alertRules: [
    { id: 'low-inventory', condition: 'vehicles.available < threshold', threshold: 10, action: 'notify:procurement' },
    { id: 'aging-inventory', condition: 'vehicles.daysInLot > threshold', threshold: 60, action: 'notify:sales' },
    { id: 'service-capacity', condition: 'service.appointmentsToday > threshold', threshold: 15, action: 'notify:service' },
    { id: 'financing-backlog', condition: 'financing.pending > threshold', threshold: 20, action: 'notify:finance' },
  ],
  actions: [
    { id: 'add-vehicle', label: 'Add Vehicle', icon: 'car', action: 'navigate:/inventory/add' },
    { id: 'schedule-test-drive', label: 'Test Drive', icon: 'calendar', action: 'navigate:/test-drives/new' },
    { id: 'view-inventory', label: 'Inventory', icon: 'list', action: 'navigate:/inventory' },
    { id: 'service-scheduling', label: 'Service Appointments', icon: 'wrench', action: 'navigate:/service/schedule' },
    { id: 'financing-apps', label: 'Financing', icon: 'dollar-sign', action: 'navigate:/financing' },
    { id: 'trade-in-eval', label: 'Trade-In Eval', icon: 'refresh-cw', action: 'navigate:/trade-in/evaluate' },
  ],
};

export function getAutomotiveDashboardConfig(role?: 'sales' | 'service' | 'finance' | 'general'): DashboardEngineConfig {
  switch (role) {
    case 'sales':
      return {
        ...AUTOMOTIVE_DASHBOARD_CONFIG,
        layouts: [AUTOMOTIVE_DASHBOARD_CONFIG.layouts[1]],
      };
    case 'service':
      return {
        ...AUTOMOTIVE_DASHBOARD_CONFIG,
        layouts: [AUTOMOTIVE_DASHBOARD_CONFIG.layouts[2]],
      };
    case 'finance':
      // Custom finance-focused layout would go here
      return AUTOMOTIVE_DASHBOARD_CONFIG;
    default:
      return AUTOMOTIVE_DASHBOARD_CONFIG;
  }
}
