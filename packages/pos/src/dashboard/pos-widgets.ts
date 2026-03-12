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
  chartType?: string;
}

// Daily Sales Summary Widget
export const DAILY_SALES_WIDGET: WidgetConfig = {
  id: 'daily-sales',
  type: 'metric',
  title: 'Today\'s Sales',
  width: 3,
  height: 2,
  dataSource: {
    type: 'service',
    service: 'POSService.getDailySalesSummary',
    refreshInterval: 300
  },
  visualization: {
    type: 'currency',
    trend: true,
    comparisonPeriod: 'yesterday'
  }
};

// Transaction Volume Widget
export const TRANSACTION_VOLUME_WIDGET: WidgetConfig = {
  id: 'transaction-volume',
  type: 'chart',
  title: 'Hourly Transaction Volume',
  chartType: 'bar',
  width: 4,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'hourly_transaction_volume' }
  }
};

// Recent Transactions Widget
export const RECENT_TRANSACTIONS_WIDGET: WidgetConfig = {
  id: 'recent-transactions',
  type: 'table',
  title: 'Recent Transactions',
  width: 5,
  height: 4,
  dataSource: {
    type: 'entity',
    entity: 'transactions',
    query: {
      where: { type: 'sale' },
      orderBy: { createdAt: 'desc' },
      limit: 10
    }
  },
  columns: [
    { key: 'id', label: 'Transaction ID' },
    { key: 'totalAmount', label: 'Amount', format: 'currency' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Time', format: 'time' }
  ]
};

// POS Terminal Status Widget
export const POS_STATUS_WIDGET: WidgetConfig = {
  id: 'pos-status',
  type: 'table',
  title: 'Terminal Status',
  width: 4,
  height: 3,
  dataSource: {
    type: 'entity',
    entity: 'pos',
    query: {
      orderBy: { status: 'asc' }
    }
  },
  columns: [
    { key: 'terminalId', label: 'Terminal' },
    { key: 'status', label: 'Status' },
    { key: 'updatedAt', label: 'Last Active', format: 'datetime' }
  ]
};

// Payment Methods Widget
export const PAYMENT_METHODS_WIDGET: WidgetConfig = {
  id: 'payment-methods',
  type: 'chart',
  title: 'Payment Method Distribution',
  chartType: 'pie',
  width: 3,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'payment_methods_distribution' }
  }
};

export const POS_WIDGETS = {
  'daily-sales': DAILY_SALES_WIDGET,
  'transaction-volume': TRANSACTION_VOLUME_WIDGET,
  'recent-transactions': RECENT_TRANSACTIONS_WIDGET,
  'pos-status': POS_STATUS_WIDGET,
  'payment-methods': PAYMENT_METHODS_WIDGET
};