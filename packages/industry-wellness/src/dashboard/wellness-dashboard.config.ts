// @ts-nocheck
import type { DashboardEngineConfig, WidgetDefinition } from '../types';

// Wellness KPI Widgets
const CLIENT_ACQUISITION: WidgetDefinition = {
  id: 'client-acquisition',
  type: 'kpi-card',
  title: 'New Clients (30 Days)',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'clients.newThisMonth' },
  refreshInterval: 3600,
};

const REVENUE_THIS_MONTH: WidgetDefinition = {
  id: 'revenue-this-month',
  type: 'kpi-card',
  title: 'Revenue This Month',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'revenue.thisMonth' },
  refreshInterval: 300,
};

const APPOINTMENTS_TODAY: WidgetDefinition = {
  id: 'appointments-today',
  type: 'kpi-card',
  title: 'Appointments Today',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'appointments.today' },
  refreshInterval: 300,
};

const CLIENT_RETENTION: WidgetDefinition = {
  id: 'client-retention',
  type: 'gauge',
  title: 'Client Retention Rate',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'clients.retentionRate' },
  visualization: { type: 'gauge', options: { min: 0, max: 100, unit: '%' } },
  refreshInterval: 3600,
};

// Chart Widgets
const POPULAR_SERVICES: WidgetDefinition = {
  id: 'popular-services',
  type: 'chart-bar',
  title: 'Most Popular Services',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'services.popularity' },
  visualization: { type: 'horizontalBar' },
  refreshInterval: 3600,
};

const REVENUE_TRENDS: WidgetDefinition = {
  id: 'revenue-trends',
  type: 'chart-line',
  title: 'Revenue Trends',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'revenue.monthly' },
  visualization: { type: 'line', options: { currency: true } },
  refreshInterval: 3600,
};

const PRACTITIONER_PERFORMANCE: WidgetDefinition = {
  id: 'practitioner-performance',
  type: 'table',
  title: 'Practitioner Performance',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'practitioners.performance' },
  refreshInterval: 1800,
};

const AT_RISK_CLIENTS: WidgetDefinition = {
  id: 'at-risk-clients',
  type: 'list',
  title: 'At-Risk Clients',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'clients.atRisk' },
  refreshInterval: 3600,
};

// Schedule and Operations Widgets
const TODAY_SCHEDULE: WidgetDefinition = {
  id: 'today-schedule',
  type: 'table',
  title: "Today's Schedule",
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'schedule.today' },
  refreshInterval: 60,
};

const UPCOMING_APPOINTMENTS: WidgetDefinition = {
  id: 'upcoming-appointments',
  type: 'calendar',
  title: 'Upcoming Appointments',
  industry: 'wellness',
  dataSource: { type: 'analytics', query: 'appointments.upcoming' },
  refreshInterval: 300,
};

export const WELLNESS_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'wellness',
  widgets: [
    CLIENT_ACQUISITION,
    REVENUE_THIS_MONTH,
    APPOINTMENTS_TODAY,
    CLIENT_RETENTION,
    POPULAR_SERVICES,
    REVENUE_TRENDS,
    PRACTITIONER_PERFORMANCE,
    AT_RISK_CLIENTS,
    TODAY_SCHEDULE,
    UPCOMING_APPOINTMENTS,
  ],
  layouts: [
    {
      id: 'default',
      name: 'Wellness Center Overview',
      breakpoints: {
        lg: [
          { i: 'client-acquisition', x: 0, y: 0, w: 3, h: 2 },
          { i: 'revenue-this-month', x: 3, y: 0, w: 3, h: 2 },
          { i: 'appointments-today', x: 6, y: 0, w: 3, h: 2 },
          { i: 'client-retention', x: 9, y: 0, w: 3, h: 2 },
          { i: 'revenue-trends', x: 0, y: 2, w: 8, h: 4 },
          { i: 'popular-services', x: 8, y: 2, w: 4, h: 4 },
          { i: 'practitioner-performance', x: 0, y: 6, w: 6, h: 4 },
          { i: 'at-risk-clients', x: 6, y: 6, w: 6, h: 4 },
          { i: 'today-schedule', x: 0, y: 10, w: 12, h: 5 },
        ],
        md: [
          { i: 'client-acquisition', x: 0, y: 0, w: 6, h: 2 },
          { i: 'revenue-this-month', x: 6, y: 0, w: 6, h: 2 },
          { i: 'appointments-today', x: 0, y: 2, w: 6, h: 2 },
          { i: 'client-retention', x: 6, y: 2, w: 6, h: 2 },
          { i: 'revenue-trends', x: 0, y: 4, w: 12, h: 4 },
          { i: 'popular-services', x: 0, y: 8, w: 12, h: 4 },
          { i: 'practitioner-performance', x: 0, y: 12, w: 12, h: 4 },
          { i: 'at-risk-clients', x: 0, y: 16, w: 12, h: 4 },
          { i: 'today-schedule', x: 0, y: 20, w: 12, h: 5 },
        ],
      },
    },
    {
      id: 'practitioner-view',
      name: 'Practitioner Dashboard',
      breakpoints: {
        lg: [
          { i: 'appointments-today', x: 0, y: 0, w: 4, h: 2 },
          { i: 'client-retention', x: 4, y: 0, w: 4, h: 2 },
          { i: 'popular-services', x: 8, y: 0, w: 4, h: 2 },
          { i: 'practitioner-performance', x: 0, y: 2, w: 12, h: 6 },
          { i: 'today-schedule', x: 0, y: 8, w: 12, h: 6 },
        ],
      },
    },
    {
      id: 'manager-view',
      name: 'Management Dashboard',
      breakpoints: {
        lg: [
          { i: 'revenue-this-month', x: 0, y: 0, w: 3, h: 2 },
          { i: 'client-acquisition', x: 3, y: 0, w: 3, h: 2 },
          { i: 'client-retention', x: 6, y: 0, w: 3, h: 2 },
          { i: 'appointments-today', x: 9, y: 0, w: 3, h: 2 },
          { i: 'revenue-trends', x: 0, y: 2, w: 12, h: 4 },
          { i: 'practitioner-performance', x: 0, y: 6, w: 8, h: 5 },
          { i: 'at-risk-clients', x: 8, y: 6, w: 4, h: 5 },
          { i: 'popular-services', x: 0, y: 11, w: 6, h: 4 },
          { i: 'upcoming-appointments', x: 6, y: 11, w: 6, h: 4 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'client-acquisition', label: 'New Clients', format: 'number' },
    { id: 'revenue-this-month', label: 'Monthly Revenue', format: 'currency' },
    { id: 'appointments-today', label: 'Today\'s Appointments', format: 'number' },
    { id: 'client-retention', label: 'Retention Rate', format: 'percent' },
  ],
  alertRules: [
    { id: 'low-appointments', condition: 'appointments.today < threshold', threshold: 5, action: 'notify:manager' },
    { id: 'high-cancellation', condition: 'appointments.cancellationRate > threshold', threshold: 20, action: 'notify:manager' },
    { id: 'at-risk-clients', condition: 'clients.atRiskCount > threshold', threshold: 10, action: 'notify:marketing' },
    { id: 'low-retention', condition: 'clients.retentionRate < threshold', threshold: 70, action: 'notify:management' },
  ],
  actions: [
    { id: 'book-appointment', label: 'Book Appointment', icon: 'calendar', action: 'navigate:/appointments/new' },
    { id: 'view-clients', label: 'Client List', icon: 'users', action: 'navigate:/clients' },
    { id: 'manage-packages', label: 'Manage Packages', icon: 'package', action: 'navigate:/packages' },
    { id: 'performance-report', label: 'Performance Report', icon: 'bar-chart', action: 'download:performance.pdf' },
    { id: 'send-communications', label: 'Send Messages', icon: 'mail', action: 'navigate:/communications' },
  ],
};

export function getWellnessDashboardConfig(role?: 'admin' | 'practitioner' | 'manager'): DashboardEngineConfig {
  switch (role) {
    case 'practitioner':
      return {
        ...WELLNESS_DASHBOARD_CONFIG,
        layouts: [WELLNESS_DASHBOARD_CONFIG.layouts[1]], // Only practitioner view
      };
    case 'manager':
      return {
        ...WELLNESS_DASHBOARD_CONFIG,
        layouts: [WELLNESS_DASHBOARD_CONFIG.layouts[2]], // Manager view
      };
    default:
      return WELLNESS_DASHBOARD_CONFIG; // Admin gets full dashboard
  }
}