/**
 * Dashboard Components Barrel Export
 */

// Core Layout Components
export { DashboardShell } from './core/DashboardShell';
export { DashboardHeader } from './core/DashboardHeader';
export { DashboardSidebar } from './core/DashboardSidebar';
export { DashboardFooter } from './core/DashboardFooter';
export { DashboardGrid } from './core/DashboardGrid';

// Plan-Based Layouts
export {
  FreeDashboardLayout,
  ProDashboardLayout,
  ProPlusDashboardLayout,
  AdaptiveDashboardLayout,
} from './layouts/PlanDashboardLayouts';

// KPI Cards
export {
  KPICard,
  RevenueKPICard,
  OrdersKPICard,
  CustomersKPICard,
  ConversionKPICard,
  AOVPKICard,
} from './kpis/KPICards';

// Charts
export {
  RevenueChart,
  OrderTrendChart,
  ConversionChart,
} from './charts/ChartComponents';

// Alerts & Actions
export {
  AlertPanel,
  ActionPanel,
  DashboardNotifications,
  AlertItem,
  ActionItem,
} from './panels/AlertActionPanels';

// Error Boundaries & Loading States
export {
  DashboardErrorBoundary,
  DashboardSkeleton,
  KPICardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from './utils/ErrorBoundary';
