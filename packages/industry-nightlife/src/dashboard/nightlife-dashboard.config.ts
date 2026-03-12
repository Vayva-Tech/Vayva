import type { DashboardEngineConfig, WidgetDefinition } from '@vayva/industry-core';

// ─── Nightlife Widget Definitions ────────────────────────────────────────────

const REVENUE_WIDGET: WidgetDefinition = {
  id: 'nightlife-revenue',
  type: 'kpi-card',
  title: 'Revenue',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.revenue.total' },
  refreshInterval: 60,
};

const COVERS_WIDGET: WidgetDefinition = {
  id: 'nightlife-covers',
  type: 'kpi-card',
  title: 'Covers',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.covers.total' },
  refreshInterval: 60,
};

const VIP_COUNT_WIDGET: WidgetDefinition = {
  id: 'nightlife-vip',
  type: 'kpi-card',
  title: 'VIP Guests',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.vip.count' },
  refreshInterval: 120,
};

const BOTTLE_SALES_WIDGET: WidgetDefinition = {
  id: 'nightlife-bottles',
  type: 'kpi-card',
  title: 'Bottle Sales',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.bottles.sold' },
  refreshInterval: 120,
};

const OCCUPANCY_WIDGET: WidgetDefinition = {
  id: 'nightlife-occupancy',
  type: 'gauge',
  title: 'Occupancy',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.occupancy.rate' },
  refreshInterval: 30,
  config: { visualization: { type: 'gauge', options: { min: 0, max: 100, unit: '%' } } },
};

const TABLE_STATUS_WIDGET: WidgetDefinition = {
  id: 'nightlife-tables',
  type: 'custom',
  title: 'Table Reservations',
  industry: 'nightlife',
  dataSource: { type: 'realtime', channel: 'tables.status' },
  component: 'TableReservations',
  refreshInterval: 30,
};

const VIP_LIST_WIDGET: WidgetDefinition = {
  id: 'nightlife-guestlist',
  type: 'custom',
  title: 'VIP Guest List',
  industry: 'nightlife',
  dataSource: { type: 'realtime', channel: 'vip.checkins' },
  component: 'VIPGuestList',
  refreshInterval: 60,
};

const BOTTLE_SERVICE_WIDGET: WidgetDefinition = {
  id: 'nightlife-bottle-service',
  type: 'custom',
  title: 'Bottle Service',
  industry: 'nightlife',
  dataSource: { type: 'realtime', channel: 'bottle.orders' },
  component: 'BottleService',
  refreshInterval: 60,
};

const DOOR_ACTIVITY_WIDGET: WidgetDefinition = {
  id: 'nightlife-door',
  type: 'custom',
  title: 'Door Activity',
  industry: 'nightlife',
  dataSource: { type: 'realtime', channel: 'door.entries' },
  component: 'DoorActivity',
  refreshInterval: 30,
};

const PROMOTER_PERFORMANCE_WIDGET: WidgetDefinition = {
  id: 'nightlife-promoters',
  type: 'custom',
  title: 'Promoter Performance',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.promoters.performance' },
  component: 'PromoterPerformance',
  refreshInterval: 300,
};

const SECURITY_LOG_WIDGET: WidgetDefinition = {
  id: 'nightlife-security',
  type: 'custom',
  title: 'Security Log',
  industry: 'nightlife',
  dataSource: { type: 'realtime', channel: 'security.incidents' },
  component: 'SecurityLog',
  refreshInterval: 60,
};

const REVENUE_TREND_WIDGET: WidgetDefinition = {
  id: 'nightlife-revenue-trend',
  type: 'chart-line',
  title: 'Revenue Trend',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.revenue.hourly' },
  refreshInterval: 300,
  config: { visualization: { type: 'line', options: { currency: true } } },
};

const DEMOGRAPHICS_WIDGET: WidgetDefinition = {
  id: 'nightlife-demographics',
  type: 'chart-pie',
  title: 'Guest Demographics',
  industry: 'nightlife',
  dataSource: { type: 'analytics', query: 'nightlife.demographics' },
  refreshInterval: 600,
  config: { visualization: { type: 'donut' } },
};

// ─── Dashboard Configuration ─────────────────────────────────────────────────

export const NIGHTLIFE_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'nightlife',
  title: 'Nightlife Dashboard',
  subtitle: 'Real-time venue management and VIP operations',
  primaryObjectLabel: 'Event',
  defaultTimeHorizon: 'today',
  sections: ['live_operations', 'decision_kpis', 'bottlenecks_alerts', 'suggested_actions'],
  widgets: [
    // KPI Cards
    REVENUE_WIDGET,
    COVERS_WIDGET,
    VIP_COUNT_WIDGET,
    BOTTLE_SALES_WIDGET,
    OCCUPANCY_WIDGET,
    
    // Main Widgets
    TABLE_STATUS_WIDGET,
    VIP_LIST_WIDGET,
    BOTTLE_SERVICE_WIDGET,
    DOOR_ACTIVITY_WIDGET,
    PROMOTER_PERFORMANCE_WIDGET,
    SECURITY_LOG_WIDGET,
    
    // Charts
    REVENUE_TREND_WIDGET,
    DEMOGRAPHICS_WIDGET,
  ],
  layouts: [
    {
      id: 'nightlife-default',
      name: 'Nightlife Overview',
      breakpoints: {
        lg: [
          // KPI Row
          { i: 'nightlife-revenue', x: 0, y: 0, w: 3, h: 2 },
          { i: 'nightlife-covers', x: 3, y: 0, w: 3, h: 2 },
          { i: 'nightlife-vip', x: 6, y: 0, w: 3, h: 2 },
          { i: 'nightlife-bottles', x: 9, y: 0, w: 3, h: 2 },
          { i: 'nightlife-occupancy', x: 12, y: 0, w: 3, h: 2 },
          
          // Left Column - Tables & Bottle Service
          { i: 'nightlife-tables', x: 0, y: 2, w: 8, h: 6 },
          { i: 'nightlife-bottle-service', x: 0, y: 8, w: 8, h: 4 },
          { i: 'nightlife-door', x: 0, y: 12, w: 8, h: 4 },
          
          // Right Column - VIP, Promoters, Security
          { i: 'nightlife-guestlist', x: 8, y: 2, w: 7, h: 5 },
          { i: 'nightlife-promoters', x: 8, y: 7, w: 7, h: 3 },
          { i: 'nightlife-security', x: 8, y: 10, w: 7, h: 3 },
          { i: 'nightlife-door', x: 8, y: 13, w: 7, h: 3 },
          
          // Charts (if space permits)
          { i: 'nightlife-revenue-trend', x: 0, y: 16, w: 8, h: 4 },
          { i: 'nightlife-demographics', x: 8, y: 16, w: 7, h: 4 },
        ],
        md: [
          { i: 'nightlife-revenue', x: 0, y: 0, w: 6, h: 2 },
          { i: 'nightlife-covers', x: 6, y: 0, w: 6, h: 2 },
          { i: 'nightlife-vip', x: 0, y: 2, w: 6, h: 2 },
          { i: 'nightlife-bottles', x: 6, y: 2, w: 6, h: 2 },
          { i: 'nightlife-occupancy', x: 0, y: 4, w: 12, h: 2 },
          { i: 'nightlife-tables', x: 0, y: 6, w: 12, h: 6 },
          { i: 'nightlife-guestlist', x: 0, y: 12, w: 12, h: 5 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'nightlife-revenue', label: 'Revenue', format: 'currency' },
    { id: 'nightlife-covers', label: 'Covers', format: 'number' },
    { id: 'nightlife-vip', label: 'VIP Guests', format: 'number' },
    { id: 'nightlife-bottles', label: 'Bottle Sales', format: 'number' },
    { id: 'nightlife-occupancy', label: 'Occupancy', format: 'percent' },
  ],
  alertRules: [
    { 
      id: 'high-occupancy', 
      name: 'High Occupancy Alert',
      condition: { metric: 'nightlife.occupancy.rate', operator: 'gt', value: 85 },
      severity: 'warning',
      message: 'Venue occupancy exceeds 85%',
    },
    { 
      id: 'low-bottle-inventory', 
      name: 'Low Bottle Inventory',
      condition: { metric: 'nightlife.bottles.inventory', operator: 'lt', value: 10 },
      severity: 'warning',
      message: 'Bottle inventory running low',
    },
    { 
      id: 'security-incident', 
      name: 'Security Incident Alert',
      condition: { metric: 'nightlife.security.activeIncidents', operator: 'gt', value: 0 },
      severity: 'critical',
      message: 'Active security incident reported',
    },
    {
      id: 'peak-time-alert',
      name: 'Peak Time Alert',
      condition: { metric: 'nightlife.wait.time', operator: 'gt', value: 30 },
      severity: 'info',
      message: 'Wait time exceeds 30 minutes',
    },
  ],
  actions: [
    { 
      id: 'new-reservation', 
      label: 'New Reservation', 
      icon: 'calendar-plus', 
      href: '/dashboard/nightlife/reservations/new'
    },
    { 
      id: 'night-report', 
      label: 'Night Report', 
      icon: 'chart-bar', 
      href: '/dashboard/nightlife/reports'
    },
    { 
      id: 'manage-tables', 
      label: 'Manage Tables', 
      icon: 'grid', 
      href: '/dashboard/nightlife/tables'
    },
    {
      id: 'vip-checkin',
      label: 'VIP Check-in',
      icon: 'user-check',
      href: '/dashboard/nightlife/vip/checkin'
    },
  ],
  failureModes: [
    'Database connection loss',
    'Real-time feed interruption',
    'Payment processing delays',
  ],
};

export function getNightlifeDashboardConfig(): DashboardEngineConfig {
  return NIGHTLIFE_DASHBOARD_CONFIG;
}
