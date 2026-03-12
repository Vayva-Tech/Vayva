/**
 * Events Industry Dashboard
 */

export const EVENTS_DASHBOARD_CONFIG = {
  industry: 'events',
  title: 'Events Dashboard',
  subtitle: 'Event Planning & Management',
  primaryObjectLabel: 'Event',
  defaultTimeHorizon: 'last_30_days',
  sections: ['overview', 'events', 'vendors', 'guests'],
  widgets: [
    {
      id: 'upcoming-events',
      type: 'kpi-card',
      title: 'Upcoming Events',
      industry: 'events',
      dataSource: { type: 'analytics', query: 'events.upcoming' },
      refreshInterval: 300,
    },
    {
      id: 'total-guests',
      type: 'kpi-card',
      title: 'Total Guests',
      industry: 'events',
      dataSource: { type: 'analytics', query: 'guests.total' },
      refreshInterval: 300,
    },
    {
      id: 'vendor-status',
      type: 'kpi-card',
      title: 'Vendor Status',
      industry: 'events',
      dataSource: { type: 'analytics', query: 'vendors.confirmed' },
      refreshInterval: 300,
    }
  ],
  layouts: [
    {
      id: 'default',
      name: 'Default Layout',
      breakpoints: {
        lg: [
          { i: 'upcoming-events', x: 0, y: 0, w: 4, h: 3 },
          { i: 'total-guests', x: 4, y: 0, w: 4, h: 3 },
          { i: 'vendor-status', x: 8, y: 0, w: 4, h: 3 }
        ]
      }
    }
  ],
  kpiCards: [
    { id: 'upcoming-events', label: 'Upcoming Events', format: 'number' },
    { id: 'total-guests', label: 'Total Guests', format: 'number' },
    { id: 'vendor-status', label: 'Confirmed Vendors', format: 'number' }
  ],
  alertRules: [
    {
      id: 'event-approaching',
      condition: 'events.daysUntil < 7',
      threshold: 7,
      action: 'notify_event_manager'
    }
  ],
  actions: [
    { id: 'create-event', label: 'Create Event', icon: 'plus', action: 'open_create_event_modal' },
    { id: 'manage-vendors', label: 'Manage Vendors', icon: 'users', action: 'open_vendor_manager' }
  ],
  failureModes: ['network_error', 'data_unavailable']
};