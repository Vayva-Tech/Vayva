// Temporarily define types locally since @vayva/core isn't available
type DashboardConfig = {
  industry: string;
  title?: string;
  description?: string;
  layout?: string;
  widgets: any[];
};

type WidgetType = 'gauge' | 'kpi-card' | 'chart' | 'table' | 'alerts';
type DataSourceType = 'analytics' | 'database' | 'notifications';

export interface TravelDashboardConfig extends DashboardConfig {
  industry: 'travel';
  widgets: TravelWidget[];
}

export interface TravelWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  dataSource: TravelDataSource;
  size?: 'small' | 'medium' | 'large' | 'full';
  position?: { x: number; y: number; width: number; height: number };
  settings?: Record<string, any>;
}

export interface TravelDataSource {
  type: DataSourceType;
  query: string;
  params?: Record<string, any>;
  refreshInterval?: number; // in seconds
}

export const TRAVEL_DASHBOARD_CONFIG: TravelDashboardConfig = {
  industry: 'travel',
  title: 'Travel & Hospitality Dashboard',
  description: 'Comprehensive dashboard for property management and analytics',
  layout: 'grid',
  widgets: [
    // KPI Cards - Row 1
    {
      id: 'occupancy-rate',
      type: 'gauge',
      title: 'Current Occupancy Rate',
      description: 'Percentage of rooms currently occupied',
      dataSource: { 
        type: 'analytics', 
        query: 'occupancy_current',
        refreshInterval: 300 // 5 minutes
      },
      size: 'medium',
      position: { x: 0, y: 0, width: 2, height: 2 },
      settings: {
        minValue: 0,
        maxValue: 100,
        thresholds: [
          { value: 70, color: '#ef4444' }, // red - low occupancy
          { value: 85, color: '#f59e0b' }, // yellow - medium occupancy
          { value: 100, color: '#10b981' } // green - high occupancy
        ]
      }
    },
    {
      id: 'revenue-today',
      type: 'kpi-card',
      title: 'Today\'s Revenue',
      description: 'Total revenue generated today',
      dataSource: { 
        type: 'analytics', 
        query: 'revenue_today',
        refreshInterval: 300
      },
      size: 'medium',
      position: { x: 2, y: 0, width: 2, height: 2 },
      settings: {
        format: 'currency',
        currency: 'USD',
        trendIndicator: true
      }
    },
    {
      id: 'pending-bookings',
      type: 'kpi-card',
      title: 'Pending Bookings',
      description: 'Bookings awaiting confirmation',
      dataSource: { 
        type: 'database', 
        query: 'pending_bookings_count',
        refreshInterval: 60
      },
      size: 'small',
      position: { x: 4, y: 0, width: 1, height: 1 },
      settings: {
        format: 'number',
        icon: 'clock'
      }
    },
    {
      id: 'upcoming-arrivals',
      type: 'kpi-card',
      title: 'Today\'s Arrivals',
      description: 'Guests checking in today',
      dataSource: { 
        type: 'database', 
        query: 'today_arrivals_count',
        refreshInterval: 300
      },
      size: 'small',
      position: { x: 5, y: 0, width: 1, height: 1 },
      settings: {
        format: 'number',
        icon: 'calendar-check'
      }
    },

    // Charts - Row 2
    {
      id: 'revenue-trend',
      type: 'chart',
      title: 'Revenue Trend (Last 30 Days)',
      description: 'Daily revenue performance over the past month',
      dataSource: { 
        type: 'analytics', 
        query: 'revenue_trend_30_days',
        refreshInterval: 1800 // 30 minutes
      },
      size: 'large',
      position: { x: 0, y: 2, width: 3, height: 3 },
      settings: {
        chartType: 'line',
        xAxis: 'date',
        yAxis: 'revenue',
        color: '#3b82f6'
      }
    },
    {
      id: 'occupancy-by-property',
      type: 'chart',
      title: 'Occupancy by Property',
      description: 'Current occupancy rates across all properties',
      dataSource: { 
        type: 'analytics', 
        query: 'occupancy_by_property',
        refreshInterval: 1800
      },
      size: 'medium',
      position: { x: 3, y: 2, width: 3, height: 3 },
      settings: {
        chartType: 'bar',
        xAxis: 'property',
        yAxis: 'occupancy_rate',
        color: '#10b981'
      }
    },

    // Tables - Row 3
    {
      id: 'upcoming-bookings',
      type: 'table',
      title: 'Upcoming Arrivals (Next 7 Days)',
      description: 'Guests scheduled to arrive in the coming week',
      dataSource: { 
        type: 'database', 
        query: 'upcoming_bookings_table',
        params: { days: 7 },
        refreshInterval: 300
      },
      size: 'full',
      position: { x: 0, y: 5, width: 6, height: 4 },
      settings: {
        columns: [
          { key: 'guestName', label: 'Guest Name', sortable: true },
          { key: 'propertyName', label: 'Property', sortable: true },
          { key: 'checkInDate', label: 'Check-in', sortable: true, format: 'date' },
          { key: 'checkOutDate', label: 'Check-out', sortable: true, format: 'date' },
          { key: 'nights', label: 'Nights', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
          { key: 'status', label: 'Status', sortable: true }
        ],
        pageSize: 10,
        searchable: true,
        filterable: true
      }
    },

    // Additional Widgets - Row 4
    {
      id: 'average-daily-rate',
      type: 'kpi-card',
      title: 'Average Daily Rate (ADR)',
      description: 'Average revenue per occupied room',
      dataSource: { 
        type: 'analytics', 
        query: 'adr_current',
        refreshInterval: 1800
      },
      size: 'medium',
      position: { x: 0, y: 9, width: 2, height: 2 },
      settings: {
        format: 'currency',
        currency: 'USD',
        trendIndicator: true
      }
    },
    {
      id: 'revenue-per-available-room',
      type: 'kpi-card',
      title: 'RevPAR',
      description: 'Revenue per available room',
      dataSource: { 
        type: 'analytics', 
        query: 'revpar_current',
        refreshInterval: 1800
      },
      size: 'medium',
      position: { x: 2, y: 9, width: 2, height: 2 },
      settings: {
        format: 'currency',
        currency: 'USD',
        trendIndicator: true
      }
    },
    {
      id: 'guest-satisfaction',
      type: 'gauge',
      title: 'Guest Satisfaction',
      description: 'Average guest rating from reviews',
      dataSource: { 
        type: 'database', 
        query: 'average_guest_rating',
        refreshInterval: 3600 // 1 hour
      },
      size: 'medium',
      position: { x: 4, y: 9, width: 2, height: 2 },
      settings: {
        minValue: 0,
        maxValue: 5,
        thresholds: [
          { value: 3, color: '#ef4444' }, // red - poor
          { value: 4, color: '#f59e0b' }, // yellow - fair
          { value: 5, color: '#10b981' }  // green - excellent
        ]
      }
    },

    // Performance Metrics - Row 5
    {
      id: 'booking-conversion-rate',
      type: 'kpi-card',
      title: 'Booking Conversion Rate',
      description: 'Percentage of inquiries that convert to bookings',
      dataSource: { 
        type: 'analytics', 
        query: 'conversion_rate_monthly',
        refreshInterval: 3600
      },
      size: 'medium',
      position: { x: 0, y: 11, width: 2, height: 2 },
      settings: {
        format: 'percentage',
        trendIndicator: true
      }
    },
    {
      id: 'cancelled-bookings',
      type: 'kpi-card',
      title: 'Cancelled Bookings',
      description: 'Number of cancellations this month',
      dataSource: { 
        type: 'database', 
        query: 'cancelled_bookings_month',
        refreshInterval: 1800
      },
      size: 'medium',
      position: { x: 2, y: 11, width: 2, height: 2 },
      settings: {
        format: 'number',
        icon: 'x-circle',
        warningThreshold: 5
      }
    },
    {
      id: 'repeat-guests',
      type: 'kpi-card',
      title: 'Repeat Guests',
      description: 'Percentage of returning customers',
      dataSource: { 
        type: 'database', 
        query: 'repeat_guest_percentage',
        refreshInterval: 3600
      },
      size: 'medium',
      position: { x: 4, y: 11, width: 2, height: 2 },
      settings: {
        format: 'percentage',
        trendIndicator: true
      }
    },

    // Geographic Distribution - Row 6
    {
      id: 'guest-demographics',
      type: 'chart',
      title: 'Guest Demographics',
      description: 'Distribution of guests by country/region',
      dataSource: { 
        type: 'analytics', 
        query: 'guest_demographics',
        refreshInterval: 7200 // 2 hours
      },
      size: 'large',
      position: { x: 0, y: 13, width: 4, height: 3 },
      settings: {
        chartType: 'pie',
        valueField: 'count',
        categoryField: 'location'
      }
    },
    {
      id: 'popular-properties',
      type: 'table',
      title: 'Top Performing Properties',
      description: 'Properties with highest occupancy rates',
      dataSource: { 
        type: 'analytics', 
        query: 'top_properties_by_occupancy',
        refreshInterval: 3600
      },
      size: 'medium',
      position: { x: 4, y: 13, width: 2, height: 3 },
      settings: {
        columns: [
          { key: 'propertyName', label: 'Property' },
          { key: 'occupancyRate', label: 'Occupancy %', format: 'percentage' },
          { key: 'revenue', label: 'Revenue', format: 'currency' }
        ],
        pageSize: 5
      }
    },

    // Alerts & Notifications - Row 7
    {
      id: 'system-alerts',
      type: 'alerts',
      title: 'System Alerts',
      description: 'Important notifications and warnings',
      dataSource: { 
        type: 'notifications', 
        query: 'dashboard_alerts',
        refreshInterval: 60
      },
      size: 'full',
      position: { x: 0, y: 16, width: 6, height: 2 },
      settings: {
        alertTypes: ['warning', 'error', 'info'],
        autoDismiss: false
      }
    }
  ]
};

// Export widget groups for easier management
export const WIDGET_GROUPS = {
  kpi: ['occupancy-rate', 'revenue-today', 'pending-bookings', 'upcoming-arrivals'],
  charts: ['revenue-trend', 'occupancy-by-property', 'guest-demographics'],
  tables: ['upcoming-bookings', 'popular-properties'],
  performance: ['average-daily-rate', 'revenue-per-available-room', 'booking-conversion-rate', 'cancelled-bookings', 'repeat-guests'],
  alerts: ['system-alerts']
};

// Default dashboard layouts for different user roles
export const DASHBOARD_LAYOUTS = {
  manager: {
    title: 'Manager Dashboard',
    widgets: [...WIDGET_GROUPS.kpi, ...WIDGET_GROUPS.charts, ...WIDGET_GROUPS.tables, ...WIDGET_GROUPS.performance]
  },
  staff: {
    title: 'Staff Dashboard',
    widgets: ['upcoming-bookings', 'pending-bookings', 'upcoming-arrivals', 'system-alerts']
  },
  owner: {
    title: 'Owner Dashboard',
    widgets: [...WIDGET_GROUPS.kpi, ...WIDGET_GROUPS.charts, ...WIDGET_GROUPS.performance]
  }
};