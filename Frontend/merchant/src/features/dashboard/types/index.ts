/**
 * Dashboard API Types
 * 
 * Type definitions for all dashboard API endpoints
 */

// ─── Common Response Structure ────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ─── KPIs ─────────────────────────────────────────────────────
export interface DashboardKpis {
  revenue: number;
  orders: number;
  bookings: number;
  customers: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
  aov: number;
  returningCustomers: number;
  repeatRate: number;
  failedPayments: number;
  paymentSuccessRate: number;
  upcomingBookings: number;
  cancellations: number;
  inventoryValue: number;
  lowStockCount: number;
  pctBelowReorder: number;
  returnsCount: number;
  refundAmount: number;
  refundRate: number;
  completionRate: number;
  utilizationRate: number;
  retention: number;
}

// ─── Metrics ──────────────────────────────────────────────────
export interface MetricValue {
  value: number | string;
}

export interface DashboardMetrics {
  metrics: {
    revenue?: MetricValue;
    orders?: MetricValue;
    customers?: MetricValue;
    custom?: Record<string, number | string>;
  };
}

// ─── Alerts ───────────────────────────────────────────────────
export type AlertType = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export interface DashboardAlerts {
  alerts: Alert[];
}

// ─── Suggested Actions ────────────────────────────────────────
export type ActionPriority = 'high' | 'medium' | 'low';

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

export interface DashboardActions {
  actions: SuggestedAction[];
}

// ─── Trend Data ───────────────────────────────────────────────
export interface TrendDataPoint {
  date: string;
  value: number;
  count?: number;
}

export interface DashboardTrends {
  metric: string;
  period: '7d' | '30d' | '90d';
  data: TrendDataPoint[];
}

// ─── Overview ─────────────────────────────────────────────────
export interface StatusCounts {
  [key: string]: number;
}

export interface MeetingItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
}

export interface TicketItem {
  id: string;
  name: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
}

export interface DashboardOverview {
  statusCounts: StatusCounts;
  meetings: MeetingItem[];
  tickets: TicketItem[];
}

// ─── Activity ─────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  type: string;
  date: Date;
  time: string;
  message: string;
  user: string;
}

// ─── Customer Insights ────────────────────────────────────────
export interface CustomerTotals {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  returningCustomers: number;
  repeatRate: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  orders: number;
  spend: number;
}

export interface DashboardCustomerInsights {
  totals: CustomerTotals;
  topCustomers: TopCustomer[];
}

// ─── Earnings ─────────────────────────────────────────────────
export interface PayoutHistoryItem {
  id: string;
  amount: number;
  status: string;
  date: string;
}

export interface DashboardEarnings {
  totalSales: number;
  platformFee: number;
  netEarnings: number;
  pendingFunds: number;
  availableFunds: number;
  history: PayoutHistoryItem[];
}

// ─── Inventory Alerts ─────────────────────────────────────────
export interface InventoryAlertItem {
  id: string;
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string | null;
  available: number;
}

export interface DashboardInventoryAlerts {
  lowStockThreshold: number;
  lowCount: number;
  outOfStockCount: number;
  items: InventoryAlertItem[];
}

// ─── Recent Orders/Bookings ───────────────────────────────────
export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  refCode?: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  currency: string;
  createdAt: Date;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  itemsPreview: Array<{
    title: string;
    quantity: number;
  }>;
  itemsCount: number;
}

export interface RecentBookingItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

// ─── Aggregate Response ───────────────────────────────────────
export interface StoreInfo {
  industrySlug: string;
  currency: string;
  hasBookings: boolean;
  hasInventory: boolean;
}

export interface DashboardAggregateData {
  kpiData: DashboardKpis;
  metricsData: DashboardMetrics;
  overviewData: DashboardOverview;
  todosAlertsData: {
    todos: SuggestedAction[];
    alerts: Alert[];
  };
  activityData: ActivityItem[];
  recentPrimaryData: {
    orders?: RecentOrderItem[];
    bookings?: RecentBookingItem[];
  };
  inventoryAlertsData: DashboardInventoryAlerts | null;
  customerInsightsData: DashboardCustomerInsights;
  earningsData: DashboardEarnings;
  storeInfo: StoreInfo;
}

// ─── Refresh Response ─────────────────────────────────────────
export interface DashboardRefreshResponse {
  success: boolean;
  message?: string;
}
