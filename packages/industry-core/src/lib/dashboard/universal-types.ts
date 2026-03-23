// @ts-nocheck
import type { IndustrySlug } from "../../types";

// ========================================================================
// Universal Dashboard Types
// ========================================================================

export interface UniversalDashboardData {
  /** Core KPI metrics */
  kpis: UniversalKpiData;
  
  /** Metrics summary */
  metrics: UniversalMetricsData;
  
  /** Overview charts and status counts */
  overview: UniversalOverviewData;
  
  /** Actionable items and alerts */
  todosAlerts: UniversalTodosAlertsData;
  
  /** Recent activity feed */
  activity: UniversalActivityItem[];
  
  /** Primary object data (orders/bookings) */
  primaryObjects: {
    type: "orders" | "bookings";
    items: UniversalPrimaryObject[];
  };
  
  /** Inventory alerts (if applicable) */
  inventoryAlerts: UniversalInventoryAlertsData | null;
  
  /** Customer insights */
  customerInsights: UniversalCustomerInsightsData;
  
  /** Earnings summary */
  earnings: UniversalEarningsData;
  
  /** Store information */
  storeInfo: {
    industrySlug: IndustrySlug;
    currency: string;
    hasBookings: boolean;
    hasInventory: boolean;
    plan: string;
    isLive: boolean;
    onboardingCompleted: boolean;
  };
}

// ========================================================================
// KPI Data Types
// ========================================================================

export interface UniversalKpiData {
  revenue: number;
  orders: number;
  bookings: number;
  customers: number;
  conversionRate: number;
  
  // Change percentages
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
  
  // Additional metrics
  aov: number; // Average Order Value
  returningCustomers: number;
  repeatRate: number;
  failedPayments: number;
  paymentSuccessRate: number;
  upcomingBookings: number;
  cancellations: number;
  
  // Inventory (if applicable)
  inventoryValue?: number;
  lowStockCount?: number;
  pctBelowReorder?: number;
  
  // Returns/Refunds
  returnsCount: number;
  refundAmount: number;
  refundRate: number;
  
  // Bookings specific
  completionRate?: number;
  utilizationRate?: number;
  retention?: number;
}

// ========================================================================
// Metrics Data Types
// ========================================================================

export interface UniversalMetricsData {
  metrics: {
    revenue: { value: number };
    orders: { value: number };
    customers: { value: number };
  };
}

// ========================================================================
// Overview Data Types
// ========================================================================

export interface UniversalOverviewData {
  statusCounts: Record<string, number>;
  meetings: UniversalMeeting[];
  tickets: UniversalSupportTicket[];
}

export interface UniversalMeeting {
  id: string;
  title: string;
  subtitle: string;
  time: string;
}

export interface UniversalSupportTicket {
  id: string;
  name: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
}

// ========================================================================
// Todos & Alerts Types
// ========================================================================

export interface UniversalTodosAlertsData {
  todos: UniversalTodoItem[];
  alerts: UniversalAlertItem[];
}

export interface UniversalTodoItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

export interface UniversalAlertItem {
  id: string;
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

// ========================================================================
// Activity Types
// ========================================================================

export interface UniversalActivityItem {
  id: string;
  type: "ORDER" | "BOOKING" | "PAYOUT" | "TICKET";
  date: Date;
  time: string;
  message: string;
  user: string;
}

// ========================================================================
// Primary Object Types
// ========================================================================

export interface UniversalPrimaryObject {
  id: string;
  orderNumber?: string;
  refCode?: string | null;
  title?: string; // For bookings
  subtitle?: string; // For bookings
  status: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  total: number;
  currency: string;
  createdAt: Date;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  itemsPreview?: Array<{
    title: string;
    quantity: number;
  }>;
  itemsCount?: number;
  time?: string; // For bookings
}

// ========================================================================
// Inventory Alert Types
// ========================================================================

export interface UniversalInventoryAlertsData {
  lowStockThreshold: number;
  lowCount: number;
  outOfStockCount: number;
  items: UniversalInventoryItem[];
}

export interface UniversalInventoryItem {
  id: string;
  productId: string | undefined;
  productTitle: string;
  variantId: string | undefined;
  variantTitle: string | null;
  available: number;
}

// ========================================================================
// Customer Insights Types
// ========================================================================

export interface UniversalCustomerInsightsData {
  totals: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    returningCustomers: number;
    repeatRate: number;
  };
  topCustomers: UniversalTopCustomer[];
}

export interface UniversalTopCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  orders: number;
  spend: number;
}

// ========================================================================
// Earnings Types
// ========================================================================

export interface UniversalEarningsData {
  totalSales: number;
  platformFee: number;
  netEarnings: number;
  pendingFunds: number;
  availableFunds: number;
  history: UniversalPayoutHistory[];
}

export interface UniversalPayoutHistory {
  id: string;
  amount: number;
  status: string;
  date: string;
}

// ========================================================================
// Industry Configuration Types
// ========================================================================

export interface IndustryDashboardConfig {
  industrySlug: IndustrySlug;
  kpiKeys: string[];
  primaryObjectName: string;
  hasBookings: boolean;
  hasInventory: boolean;
  chartTypes: string[];
  allowedModules: string[];
  designCategory: "signature" | "glass" | "bold" | "dark" | "natural";
}

export interface UniversalDashboardResponse {
  success: boolean;
  data: UniversalDashboardData;
  timestamp: string;
  cacheHit?: boolean;
}