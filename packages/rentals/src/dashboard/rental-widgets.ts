export interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'form' | 'calendar' | 'kanban' | 'map' | 'feed' | 'custom';
  title: string;
  description?: string;
  width: number;
  height: number;
  permissions?: string[];
  dataSource: {
    type: 'entity' | 'service' | 'api' | 'analytics' | 'custom';
    entity?: string;
    service?: string;
    query?: Record<string, unknown>;
    refreshInterval?: number;
  };
  visualization?: {
    type: string;
    trend?: boolean;
    comparisonPeriod?: string;
  };
  columns?: Array<{ key: string; label: string; format?: string }>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: string | number;
    severity: 'critical' | 'warning' | 'info';
  }>;
  condition?: (data: unknown) => boolean;
  message?: (data: unknown) => string;
  severity?: 'critical' | 'warning' | 'info';
  chartType?: string;
}

// Active Rentals Widget
export const ACTIVE_RENTALS_WIDGET: WidgetConfig = {
  id: 'active-rentals',
  type: 'metric',
  title: 'Active Rentals',
  width: 3,
  height: 2,
  dataSource: {
    type: 'entity',
    entity: 'rentals',
    query: {
      where: { status: 'active' },
      count: true
    }
  },
  visualization: {
    type: 'number',
    trend: true,
    comparisonPeriod: 'last_week'
  }
};

// Overdue Rentals Widget
export const OVERDUE_RENTALS_WIDGET: WidgetConfig = {
  id: 'overdue-rentals',
  type: 'alert',
  title: 'Overdue Rentals',
  width: 4,
  height: 3,
  severity: 'critical',
  dataSource: {
    type: 'entity',
    entity: 'rentals',
    query: {
      where: { 
        status: 'active',
        endDate: { lt: new Date() }
      }
    }
  },
  conditions: [
    {
      field: 'days_overdue',
      operator: 'gt',
      value: 0,
      severity: 'critical'
    }
  ]
};

// Revenue Today Widget
export const RENTAL_REVENUE_WIDGET: WidgetConfig = {
  id: 'rental-revenue',
  type: 'metric',
  title: 'Today\'s Rental Revenue',
  width: 3,
  height: 2,
  dataSource: {
    type: 'analytics',
    query: { metric: 'daily_rental_revenue' }
  },
  visualization: {
    type: 'currency',
    trend: true,
    comparisonPeriod: 'yesterday'
  }
};

// Popular Items Widget
export const POPULAR_ITEMS_WIDGET: WidgetConfig = {
  id: 'popular-items',
  type: 'chart',
  title: 'Most Rented Items',
  chartType: 'bar',
  width: 4,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'most_rented_items' }
  }
};

// Upcoming Returns Widget
export const UPCOMING_RETURNS_WIDGET: WidgetConfig = {
  id: 'upcoming-returns',
  type: 'table',
  title: 'Returns Due Soon',
  width: 5,
  height: 4,
  dataSource: {
    type: 'entity',
    entity: 'rentals',
    query: {
      where: { 
        status: 'active',
        endDate: {
          gte: new Date(),
          lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000) // Next 3 days
        }
      },
      orderBy: { endDate: 'asc' }
    }
  },
  columns: [
    { key: 'customer.name', label: 'Customer' },
    { key: 'item.name', label: 'Item' },
    { key: 'endDate', label: 'Due Date', format: 'date' },
    { key: 'totalPrice', label: 'Value', format: 'currency' }
  ]
};

// Rental Utilization Widget
export const RENTAL_UTILIZATION_WIDGET: WidgetConfig = {
  id: 'rental-utilization',
  type: 'chart',
  title: 'Item Utilization Rate',
  chartType: 'gauge',
  width: 3,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'item_utilization_rate' }
  }
};

export const RENTAL_WIDGETS = {
  'active-rentals': ACTIVE_RENTALS_WIDGET,
  'overdue-rentals': OVERDUE_RENTALS_WIDGET,
  'rental-revenue': RENTAL_REVENUE_WIDGET,
  'popular-items': POPULAR_ITEMS_WIDGET,
  'upcoming-returns': UPCOMING_RETURNS_WIDGET,
  'rental-utilization': RENTAL_UTILIZATION_WIDGET
};