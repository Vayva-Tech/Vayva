/**
 * Automotive Dashboard Configuration
 */

export const AUTOMOTIVE_DASHBOARD_CONFIG = {
  industry: 'automotive',
  title: 'Automotive Dashboard',
  subtitle: 'Vehicle Sales & Management',
  primaryObjectLabel: 'Vehicle',
  defaultTimeHorizon: 'last_30_days',
  sections: ['overview', 'sales', 'inventory', 'performance'],
  widgets: [
    {
      id: 'total-inventory',
      type: 'kpi-card',
      title: 'Total Inventory',
      industry: 'automotive',
      dataSource: { type: 'analytics', query: 'vehicles.total' },
      refreshInterval: 300,
    },
    {
      id: 'vehicles-sold',
      type: 'kpi-card',
      title: 'Sold This Month',
      industry: 'automotive',
      dataSource: { type: 'analytics', query: 'vehicles.soldThisMonth' },
      refreshInterval: 300,
    },
    {
      id: 'monthly-revenue',
      type: 'kpi-card',
      title: 'Monthly Revenue',
      industry: 'automotive',
      dataSource: { type: 'analytics', query: 'revenue.thisMonth' },
      refreshInterval: 300,
    },
    {
      id: 'test-drive-conversion',
      type: 'kpi-card',
      title: 'Test Drive Conversion',
      industry: 'automotive',
      dataSource: { type: 'analytics', query: 'testdrives.conversionRate' },
      refreshInterval: 300,
    }
  ],
  layouts: [
    {
      id: 'default',
      name: 'Default Layout',
      breakpoints: {
        lg: [
          { i: 'total-inventory', x: 0, y: 0, w: 6, h: 3 },
          { i: 'vehicles-sold', x: 6, y: 0, w: 6, h: 3 },
          { i: 'monthly-revenue', x: 0, y: 3, w: 6, h: 3 },
          { i: 'test-drive-conversion', x: 6, y: 3, w: 6, h: 3 }
        ]
      }
    }
  ],
  kpiCards: [
    { id: 'total-inventory', label: 'Total Vehicles', format: 'number' },
    { id: 'vehicles-sold', label: 'Vehicles Sold', format: 'number' },
    { id: 'monthly-revenue', label: 'Revenue', format: 'currency' },
    { id: 'test-drive-conversion', label: 'Conversion Rate', format: 'percent' }
  ],
  alertRules: [
    {
      id: 'low-inventory',
      condition: 'inventory.count < 10',
      threshold: 10,
      action: 'notify_sales_manager'
    }
  ],
  actions: [
    { id: 'add-vehicle', label: 'Add Vehicle', icon: 'plus', action: 'open_add_vehicle_modal' },
    { id: 'schedule-test-drive', label: 'Schedule Test Drive', icon: 'calendar', action: 'open_schedule_modal' }
  ],
  failureModes: ['network_error', 'data_unavailable']
};