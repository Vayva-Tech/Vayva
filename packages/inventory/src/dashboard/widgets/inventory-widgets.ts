import type { Inventory as _Inventory } from '../../services/inventory-service';

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

// Sales Overview Widget
export const SALES_OVERVIEW_WIDGET: WidgetConfig = {
  id: 'sales-overview',
  type: 'metric',
  title: 'Today\'s Sales',
  width: 3,
  height: 2,
  dataSource: {
    type: 'analytics',
    query: { metric: 'daily_sales_summary' },
    refreshInterval: 300
  },
  visualization: {
    type: 'currency',
    trend: true,
    comparisonPeriod: 'yesterday'
  }
};

// Inventory Alerts Widget
export const INVENTORY_ALERTS_WIDGET: WidgetConfig = {
  id: 'inventory-alerts',
  type: 'alert',
  title: 'Stock Alerts',
  width: 4,
  height: 3,
  dataSource: {
    type: 'service',
    service: 'InventoryService.getReorderItems'
  },
  conditions: [
    {
      field: 'available',
      operator: 'lt',
      value: 'reorderPoint',
      severity: 'critical'
    },
    {
      field: 'available',
      operator: 'lte',
      value: 'reorderPoint * 1.5',
      severity: 'warning'
    }
  ]
};

// Recent Orders Widget
export const RECENT_ORDERS_WIDGET: WidgetConfig = {
  id: 'recent-orders',
  type: 'table',
  title: 'Recent Orders',
  width: 5,
  height: 4,
  dataSource: {
    type: 'entity',
    entity: 'orders',
    query: {
      orderBy: { createdAt: 'desc' },
      limit: 10
    }
  },
  columns: [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'customer.name', label: 'Customer' },
    { key: 'total', label: 'Amount', format: 'currency' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date', format: 'datetime' }
  ]
};

// Current Inventory Levels Widget
export const INVENTORY_LEVELS_WIDGET: WidgetConfig = {
  id: 'inventory-levels',
  type: 'table',
  title: 'Current Inventory Levels',
  width: 6,
  height: 4,
  dataSource: {
    type: 'entity',
    entity: 'inventory',
    query: {
      select: ['product.name', 'quantity', 'reserved', 'available', 'reorderPoint'],
      where: { available: { lt: 'reorderPoint' } },
      orderBy: { available: 'asc' }
    }
  },
  columns: [
    { key: 'product.name', label: 'Product' },
    { key: 'quantity', label: 'On Hand' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'available', label: 'Available' },
    { key: 'reorderPoint', label: 'Reorder Point' }
  ]
};

// Low Stock Alerts Widget
export const LOW_STOCK_ALERTS_WIDGET: WidgetConfig = {
  id: 'low-stock-alerts',
  type: 'alert',
  title: 'Low Stock Alerts',
  width: 4,
  height: 3,
  severity: 'warning',
  dataSource: {
    type: 'service',
    service: 'InventoryService.getReorderItems'
  },
  condition: (data: unknown[]) => data.length > 0,
  message: (data: unknown[]) => `${data.length} items below reorder point`
};

// Inventory Turnover Widget
export const INVENTORY_TURNOVER_WIDGET: WidgetConfig = {
  id: 'inventory-turnover',
  type: 'chart',
  title: 'Inventory Turnover Rate',
  width: 4,
  height: 3,
  chartType: 'line',
  dataSource: {
    type: 'analytics',
    query: { metric: 'inventory_turnover_by_category' }
  }
};

export const INVENTORY_WIDGETS = {
  'sales-overview': SALES_OVERVIEW_WIDGET,
  'inventory-alerts': INVENTORY_ALERTS_WIDGET,
  'recent-orders': RECENT_ORDERS_WIDGET,
  'inventory-levels': INVENTORY_LEVELS_WIDGET,
  'low-stock-alerts': LOW_STOCK_ALERTS_WIDGET,
  'inventory-turnover': INVENTORY_TURNOVER_WIDGET
};