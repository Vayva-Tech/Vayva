import type { IndustrySlug } from "@/lib/templates/types";

/**
 * Typed API response shapes for all dashboard endpoints.
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 * Eliminates `as any` casts in the dashboard page by providing
 * proper types for SWR generics.
 */

// ─── /api/dashboard/kpis ────────────────────────────────
export interface DashboardKpiData {
  success: boolean;
  data: {
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
  };
}

// ─── /api/dashboard/metrics ─────────────────────────────
export interface MetricValue {
  value: number | string;
}

export interface DashboardMetricsData {
  metrics: Record<string, MetricValue | undefined> & {
    revenue?: MetricValue;
    orders?: MetricValue;
    customers?: MetricValue;
    custom?: Record<string, number | string>;
  };
}

// ─── /api/auth/merchant/me ──────────────────────────────
export interface MerchantMeData {
  data?: MerchantMePayload;
  // Flat shape fallback (some endpoints return without `data` wrapper)
  merchant?: MerchantMePayload["merchant"];
  features?: MerchantMePayload["features"];
}

export interface MerchantMePayload {
  merchant?: {
    plan?: string;
    enabledExtensionIds?: string[];
    industrySlug?: string;
  };
  features?: {
    dashboard?: {
      v2Enabled?: boolean;
      planTier?: string;
      cosmeticVariant?: string | null;
    };
  };
}

// ─── /api/dashboard/overview ────────────────────────────
export interface OverviewMeeting {
  id: string;
  title: string;
  subtitle: string;
  time: string;
}

export interface OverviewTicket {
  id: string;
  name: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
}

export interface IncomeExpenseRow {
  label: string;
  income: number;
  expense: number;
}

export interface InvoiceRow {
  key: string;
  label: string;
  count: number;
  amount: number;
  color: string;
}

export interface DashboardOverviewData {
  success: boolean;
  data?: {
    range: { key: string; start: string; end: string };
    donut: { inProgress: number; completed: number; notStarted: number };
    statusCounts: Record<string, number>;
    incomeVsExpense: IncomeExpenseRow[];
    invoiceRows: InvoiceRow[];
    invoiceOverviewRows: InvoiceRow[];
    meetings: OverviewMeeting[];
    tickets: OverviewTicket[];
  };
  // Flat shape fallback
  overview?: DashboardOverviewData["data"];
}

// ─── /api/dashboard/todos-alerts ────────────────────────
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  priority?: string;
  completed?: boolean;
}

export interface DashboardTodosAlertsData {
  data?: { todos: TodoItem[] };
  todos?: TodoItem[];
}

// ─── /api/dashboard/recent-orders or recent-bookings ────
export interface RecentOrderItem {
  id: string;
  orderNumber?: string;
  refCode?: string;
  total?: number;
  currency?: string;
  status?: string;
  paymentStatus?: string;
  customer?: { name?: string };
  itemsPreview?: Array<{ quantity: number; title: string }>;
  // Booking fields
  title?: string;
  subtitle?: string;
  time?: string;
}

export interface DashboardRecentPrimaryData {
  data?: {
    orders?: RecentOrderItem[];
    bookings?: RecentOrderItem[];
  };
  orders?: RecentOrderItem[];
  bookings?: RecentOrderItem[];
}

// ─── /api/dashboard/inventory-alerts ────────────────────
export interface InventoryAlertItem {
  id: string;
  productTitle: string;
  available: number;
}

export interface DashboardInventoryAlertsData {
  data?: InventoryAlertsPayload;
  lowCount?: number;
  outOfStockCount?: number;
  items?: InventoryAlertItem[];
}

export interface InventoryAlertsPayload {
  lowCount: number;
  outOfStockCount: number;
  items: InventoryAlertItem[];
}

// ─── /api/dashboard/customer-insights ───────────────────
export interface TopCustomer {
  id: string;
  name: string;
  spend: number;
}

export interface DashboardCustomerInsightsData {
  data?: CustomerInsightsPayload;
  totals?: CustomerInsightsPayload["totals"];
  topCustomers?: TopCustomer[];
}

export interface CustomerInsightsPayload {
  totals: {
    newCustomers: number;
    repeatRate: number;
  };
  topCustomers: TopCustomer[];
}

// ─── /api/dashboard/earnings ────────────────────────────
export interface DashboardEarningsData {
  totalEarnings?: number;
  pendingPayouts?: number;
  lastPayout?: number;
  [key: string]: unknown;
}

// ─── /api/fulfillment/shipments ─────────────────────────
export interface DashboardShipmentsData {
  data?: unknown[];
  [key: string]: unknown;
}

// ─── /api/dashboard/activity ────────────────────────────
export interface ActivityItem {
  id: string;
  type?: string;
  message?: string;
  time?: string;
}

export type DashboardActivityData = ActivityItem[];

// ─── /api/dashboard/industry-overview ───────────────────
export interface IndustryOverviewDefinition {
  title?: string;
  subtitle?: string;
  primaryObjectLabel?: string;
  sections?: string[];
}

export interface ProductHealthItem {
  id: string;
  title: string;
  unitsSold?: number;
  stock?: number;
}

export interface IndustryDashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  evidence?: { key: string; value: number };
}

export interface IndustrySuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: "critical" | "warning" | "info";
  href: string;
  icon: string;
}

export interface DashboardIndustryOverviewData {
  data?: {
    definition?: IndustryOverviewDefinition;
    primaryObjectHealth?: {
      topSellingProducts?: ProductHealthItem[];
      lowStockProducts?: ProductHealthItem[];
      deadStockProducts?: ProductHealthItem[];
    };
    liveOperations?: Record<string, number | string>;
    alerts?: IndustryDashboardAlert[];
    suggestedActions?: IndustrySuggestedAction[];
  };
}
export interface DashboardAggregateData {
  kpiData: DashboardKpiData;
  metricsData: DashboardMetricsData;
  overviewData: DashboardOverviewData;
  todosAlertsData: DashboardTodosAlertsData;
  activityData: DashboardActivityData;
  recentPrimaryData: DashboardRecentPrimaryData;
  inventoryAlertsData: DashboardInventoryAlertsData | null;
  customerInsightsData: DashboardCustomerInsightsData;
  earningsData: DashboardEarningsData;
  storeInfo: {
    industrySlug: IndustrySlug;
    currency: string;
    hasBookings: boolean;
    hasInventory: boolean;
  };
}
