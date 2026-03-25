import type { DashboardEngineConfig, WidgetDefinition } from '../types';

const UPCOMING_EVENTS_WIDGET: WidgetDefinition = {
  id: 'upcoming-events',
  type: 'kpi-card',
  title: 'Upcoming Events',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'events.upcoming' },
  refreshInterval: 300,
};

const TICKETS_SOLD_WIDGET: WidgetDefinition = {
  id: 'tickets-sold',
  type: 'kpi-card',
  title: 'Tickets Sold',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'tickets.sold' },
  refreshInterval: 60,
};

const REVENUE_WIDGET: WidgetDefinition = {
  id: 'event-revenue',
  type: 'kpi-card',
  title: 'Event Revenue',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'revenue.total' },
  refreshInterval: 300,
};

const CHECK_IN_RATE_WIDGET: WidgetDefinition = {
  id: 'check-in-rate',
  type: 'gauge',
  title: 'Check-in Rate',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'events.checkInRate' },
  visualization: { type: 'gauge', options: { min: 0, max: 100, unit: '%' } },
  refreshInterval: 60,
};

const REVENUE_TREND_WIDGET: WidgetDefinition = {
  id: 'revenue-trend',
  type: 'chart-line',
  title: 'Revenue Trend',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'revenue.monthly' },
  visualization: { type: 'line', options: { currency: true } },
  refreshInterval: 3600,
};

const TICKETS_BY_CATEGORY_WIDGET: WidgetDefinition = {
  id: 'tickets-by-category',
  type: 'chart-pie',
  title: 'Events by Category',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'events.byCategory' },
  visualization: { type: 'donut' },
  refreshInterval: 3600,
};

const TOP_EVENTS_WIDGET: WidgetDefinition = {
  id: 'top-events',
  type: 'table',
  title: 'Top Events by Revenue',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'events.topByRevenue' },
  refreshInterval: 3600,
};

const UPCOMING_SCHEDULE_WIDGET: WidgetDefinition = {
  id: 'upcoming-schedule',
  type: 'calendar',
  title: 'Upcoming Schedule',
  industry: 'events',
  dataSource: { type: 'analytics', query: 'events.schedule' },
  refreshInterval: 300,
};

export const EVENTS_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'events',
  widgets: [
    UPCOMING_EVENTS_WIDGET,
    TICKETS_SOLD_WIDGET,
    REVENUE_WIDGET,
    CHECK_IN_RATE_WIDGET,
    REVENUE_TREND_WIDGET,
    TICKETS_BY_CATEGORY_WIDGET,
    TOP_EVENTS_WIDGET,
    UPCOMING_SCHEDULE_WIDGET,
  ],
  layouts: [
    {
      id: 'default',
      name: 'Events Overview',
      breakpoints: {
        lg: [
          { i: 'upcoming-events', x: 0, y: 0, w: 3, h: 2 },
          { i: 'tickets-sold', x: 3, y: 0, w: 3, h: 2 },
          { i: 'event-revenue', x: 6, y: 0, w: 3, h: 2 },
          { i: 'check-in-rate', x: 9, y: 0, w: 3, h: 2 },
          { i: 'revenue-trend', x: 0, y: 2, w: 8, h: 4 },
          { i: 'tickets-by-category', x: 8, y: 2, w: 4, h: 4 },
          { i: 'top-events', x: 0, y: 6, w: 6, h: 4 },
          { i: 'upcoming-schedule', x: 6, y: 6, w: 6, h: 4 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'upcoming-events', label: 'Upcoming Events', format: 'number' },
    { id: 'tickets-sold', label: 'Tickets Sold', format: 'number' },
    { id: 'event-revenue', label: 'Total Revenue', format: 'currency' },
    { id: 'check-in-rate', label: 'Check-in Rate', format: 'percent' },
  ],
  alertRules: [
    { id: 'low-ticket-sales', condition: 'tickets.salesRate < threshold', threshold: 50, action: 'notify:marketing' },
    { id: 'event-capacity', condition: 'event.capacity > threshold', threshold: 90, action: 'notify:organizer' },
  ],
  actions: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar-plus', action: 'navigate:/events/new' },
    { id: 'scan-tickets', label: 'Scan Tickets', icon: 'qr-code', action: 'navigate:/events/check-in' },
    { id: 'view-events', label: 'All Events', icon: 'calendar', action: 'navigate:/events' },
  ],
};

export function getEventsDashboardConfig(): DashboardEngineConfig {
  return EVENTS_DASHBOARD_CONFIG;
}
