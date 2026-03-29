/**
 * Dashboard Modules - Modular components for UnifiedDashboard
 * 
 * Extracted from UniversalProDashboard, UniversalProDashboardV2, and DashboardV2Content
 * 
 * @see UnifiedDashboard.tsx
 */

// Core Modules
export { MetricCard, RevenueMetric, OrdersMetric, CustomersMetric, ConversionMetric, IndustryMetrics } from './MetricsModule';
export type { MetricCardProps } from './MetricsModule';

export { TasksModule, IndustryTasks } from './TasksModule';
export type { Task } from './TasksModule';

export { RevenueChart, DonutChart, OrderStatusChart, IndustryCharts } from './ChartsModule';
export type { ChartDataPoint, DonutChartProps } from './ChartsModule';

export { AlertsModule, AlertPresets } from './AlertsModule';
export type { Alert } from './AlertsModule';

// Module presets for quick composition
export const DashboardModules = {
  Metrics: {
    Card: MetricCard,
    Revenue: RevenueMetric,
    Orders: OrdersMetric,
    Customers: CustomersMetric,
    Conversion: ConversionMetric,
  },
  Tasks: TasksModule,
  Charts: {
    Revenue: RevenueChart,
    Donut: DonutChart,
    OrderStatus: OrderStatusChart,
  },
  Alerts: AlertsModule,
};
