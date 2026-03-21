import type { IndustrySlug } from "@/lib/templates/types";

/**
 * KPI NAMING STANDARDS
 *
 * Consistent naming prevents drift and ensures clarity across all variants.
 *
 * Revenue Metrics:
 * - "Revenue" (not "Sales" or "Total Sales")
 * - "GMV" (Gross Merchandise Value - Marketplace only)
 * - "Donations" (Nonprofit only)
 *
 * Order/Transaction Metrics:
 * - "Orders" (Commerce: Retail, Fashion, Digital, Food)
 * - "Bookings" (Services, Travel, Real Estate)
 * - "Enrollments" (Education)
 * - "Tickets Sold" (Events, Nightlife)
 *
 * Customer Metrics:
 * - "Customers" (new customers)
 * - "Returning Customers" (not "Repeat Customers")
 * - "Repeat Rate" (percentage, not "Retention Rate" for this metric)
 *
 * Refund/Return Metrics:
 * - "Refund Amount" (currency format)
 * - "Refund Rate" (percent format)
 * - "Returns Count" or "Returns" (number format)
 *
 * Value Metrics:
 * - "AOV" (Average Order Value - not "Average Sale")
 * - "Avg Stay Value" (Travel/Hospitality only)
 * - Never use "Average Sale" or "Sale Value"
 *
 * Inventory Metrics:
 * - "Inventory Value" (estimated total value)
 * - "Low Stock Items" or "Low Stock Count" (not "Low Inventory")
 *
 * Strategic Metrics (Advanced Tier):
 * - "Completion Rate" (completed / total)
 * - "Utilization Rate" or "Utilization" (capacity filled)
 * - "Retention" (customer retention month-over-month)
 *
 * Payment Metrics (Basic/Standard only):
 * - "Payment Success Rate" or "Payment Success" (avoid in Advanced tier)
 */

export type DashboardPlanTier = "basic" | "standard" | "advanced" | "pro";
export type DashboardThemeMode = "light" | "dark" | "mint";
export type DashboardKpiFormat = "currency" | "number" | "percent";
export type DashboardInvoiceSource = "payments" | "invoices";
export type DashboardKpiKey =
  | "revenue"
  | "orders"
  | "bookings"
  | "customers"
  | "returningCustomers"
  | "repeatRate"
  | "paymentSuccessRate"
  | "aov"
  | "inventoryValue"
  | "lowStockCount"
  | "returnsCount"
  | "refundAmount"
  | "refundRate"
  | "upcomingBookings"
  | "cancellations"
  | "completionRate" // Education/Services: Completed bookings / Total bookings
  | "utilizationRate" // Services: Booked slots / Available slots
  | "retention" // Education/Subscription: Active customers this month / Active last month
  | "conversionRate" // AI/Pro: Conversion rate
  | "aiConversions" // AI/Pro: Conversions captured by AI
  | "aiConversations" // AI/Pro: Ongoing AI chats
  | "aiUsage"; // AI/Pro: Usage metrics

export interface DashboardKpiSlot {
  key: DashboardKpiKey;
  label: string;
  helperText?: string;
  format: DashboardKpiFormat;
}

export interface DashboardPipelineSegmentSpec {
  key:
    | "completed"
    | "pending"
    | "in_progress"
    | "not_started"
    | "cancelled"
    | "returned"
    | "refunded"
    | string;
  label: string;
  color: string;
  statuses: string[];
}

export interface DashboardPipelineSpec {
  donutStyle: "thin" | "medium" | "thick";
  legend: "inline" | "stacked_right";
  segments: DashboardPipelineSegmentSpec[];
}

export interface DashboardIncomeExpenseSpec {
  chart: "line" | "area";
  expenseDefinition: string;
}

export interface DashboardInvoiceRowSpec {
  key: string;
  label: string;
  color: string;
}

export interface DashboardInvoiceOverviewSpec {
  source: DashboardInvoiceSource;
  rows: DashboardInvoiceRowSpec[];
}

export interface DashboardRightRailSpec {
  inventoryAlerts: "always" | "critical_only" | "hidden";
  inventoryCriticalLowCount?: number;
  customerInsights?: "full" | "limited" | "hidden";
  earningsCard?: "full" | "summary" | "hidden";
}

/**
 * BASIC TIER CAPABILITY CONTRACT
 *
 * Basic tier is designed for free/starter plans and has explicit limitations:
 * - No Finance module (/dashboard/finance)
 * - No Marketing module (/dashboard/marketing)
 * - No Invoice Overview card (dashboard)
 * - No advanced filters
 * - Limited customer insights (top 3 only)
 * - No inventory alerts
 * - Max 4 KPI slots
 * - Only basic KPIs allowed
 */
export interface DashboardTierCapabilities {
  hasFinanceModule: boolean;
  hasMarketingModule: boolean;
  hasInvoiceOverview: boolean;
  hasAdvancedFilters: boolean;
  hasCustomerInsights: "full" | "limited" | "none";
  hasInventoryAlerts: boolean;
  maxKpiSlots: number;
  allowedKpis?: DashboardKpiKey[];
}

export interface DashboardVariantSpec {
  key: string;
  tier: DashboardPlanTier;
  appliesTo: IndustrySlug[];
  theme: DashboardThemeMode;
  supportsDarkMode?: boolean; // Can user toggle dark mode?
  kpis: DashboardKpiSlot[];
  pipeline: DashboardPipelineSpec;
  incomeVsExpense: DashboardIncomeExpenseSpec;
  invoiceOverview: DashboardInvoiceOverviewSpec;
  rightRail: DashboardRightRailSpec;
  capabilities?: DashboardTierCapabilities;
}

function normalizePlan(rawPlan: any): string {
  return String(rawPlan || "")
    .trim()
    .toLowerCase();
}

export function resolveDashboardPlanTier(rawPlan: any): DashboardPlanTier {
  const v = normalizePlan(rawPlan);

  if (
    v === "pro" ||
    v === "business" ||
    v === "enterprise" ||
    v === "professional" ||
    v === "premium"
  ) {
    return "pro";
  }
  if (v === "starter") return "standard";

  // Free / unknown
  return "basic";
}

const ALL_INDUSTRIES: IndustrySlug[] = [
  "retail",
  "fashion",
  "electronics",
  "beauty",
  "grocery",
  "food",
  "services",
  "digital",
  "events",
  "b2b",
  "real_estate",
  "automotive",
  "travel_hospitality",
  "blog_media",
  "creative_portfolio",
  "nonprofit",
  "education",
  "marketplace",
  "one_product",
  "nightlife",
];

const BASIC_GLOBAL: DashboardVariantSpec = {
  key: "basic_global",
  tier: "basic",
  appliesTo: ALL_INDUSTRIES,
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: {
    donutStyle: "medium",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["DELIVERED", "COMPLETED"],
      },
      {
        key: "pending",
        label: "In Progress",
        color: "#3B82F6",
        statuses: [
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "FULFILLING",
          "OUT_FOR_DELIVERY",
          "SHIPPED",
          "PENDING",
          "CONFIRMED",
        ],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED", "NO_SHOW"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Refunds + fees",
  },
  invoiceOverview: {
    source: "payments",
    rows: [
      { key: "SUCCESS", label: "Paid", color: "#22C55E" },
      { key: "PENDING", label: "Pending", color: "#7C3AED" },
      { key: "FAILED", label: "Failed", color: "#F59E0B" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "limited",
    earningsCard: "summary",
  },
  capabilities: {
    hasFinanceModule: false,
    hasMarketingModule: false,
    hasInvoiceOverview: false,
    hasAdvancedFilters: false,
    hasCustomerInsights: "limited",
    hasInventoryAlerts: false,
    maxKpiSlots: 4,
    allowedKpis: [
      "revenue",
      "orders",
      "customers",
      "paymentSuccessRate",
      "bookings",
    ],
  },
};

const RETAIL_STANDARD_INVENTORY_FIRST: DashboardVariantSpec = {
  key: "retail_inventory_first",
  tier: "standard",
  appliesTo: ["retail", "grocery", "electronics", "one_product"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Total Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "inventoryValue",
      label: "Inventory Value",
      helperText: "Estimated",
      format: "currency",
    },
    {
      key: "lowStockCount",
      label: "Low Stock Items",
      helperText: "Below threshold",
      format: "number",
    },
  ],
  pipeline: {
    donutStyle: "thick",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["DELIVERED"],
      },
      {
        key: "pending",
        label: "Pending",
        color: "#3B82F6",
        statuses: [
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "FULFILLING",
          "OUT_FOR_DELIVERY",
          "SHIPPED",
        ],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + delivery costs",
  },
  invoiceOverview: {
    source: "invoices",
    rows: [
      { key: "PAID", label: "Paid", color: "#22C55E" },
      { key: "OVERDUE", label: "Overdue", color: "#F59E0B" },
      { key: "DRAFT", label: "Draft", color: "#94A3B8" },
    ],
  },
  rightRail: {
    inventoryAlerts: "always",
    customerInsights: "full",
    earningsCard: "full",
  },
};

const FASHION_STANDARD_BRAND_GROWTH: DashboardVariantSpec = {
  key: "fashion_brand_growth_standard",
  tier: "standard",
  appliesTo: ["fashion"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "returningCustomers",
      label: "Returning Customers",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "aov",
      label: "Average Order Value",
      helperText: "Paid orders",
      format: "currency",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + delivery costs",
  },
  invoiceOverview: {
    source: "payments",
    rows: [
      { key: "SUCCESS", label: "Paid", color: "#22C55E" },
      { key: "PENDING", label: "Pending", color: "#7C3AED" },
    ],
  },
  rightRail: {
    inventoryAlerts: "critical_only",
    inventoryCriticalLowCount: 5,
    customerInsights: "full",
    earningsCard: "full",
  },
};

const BEAUTY_STANDARD_BRAND_GROWTH: DashboardVariantSpec = {
  key: "beauty_brand_growth_standard",
  tier: "standard",
  appliesTo: ["beauty"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "returningCustomers",
      label: "Returning Customers",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "aov",
      label: "Average Order Value",
      helperText: "Paid orders",
      format: "currency",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: RETAIL_STANDARD_INVENTORY_FIRST.incomeVsExpense,
  invoiceOverview: FASHION_STANDARD_BRAND_GROWTH.invoiceOverview,
  rightRail: FASHION_STANDARD_BRAND_GROWTH.rightRail,
};

const SERVICES_STANDARD_BOOKINGS_FOCUS: DashboardVariantSpec = {
  key: "services_bookings_focus",
  tier: "standard",
  appliesTo: ["services", "education", "real_estate"],
  theme: "light",
  kpis: [
    {
      key: "bookings",
      label: "Total Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "upcomingBookings",
      label: "Upcoming",
      helperText: "Next 7 days",
      format: "number",
    },
    {
      key: "cancellations",
      label: "Cancellations",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
  ],
  pipeline: {
    donutStyle: "thin",
    legend: "inline",
    segments: [
      {
        key: "pending",
        label: "Upcoming",
        color: "#3B82F6",
        statuses: ["PENDING", "CONFIRMED"],
      },
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["COMPLETED"],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED", "NO_SHOW"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Staff payouts + platform fees",
  },
  invoiceOverview: {
    source: "payments",
    rows: [
      { key: "SUCCESS", label: "Paid", color: "#22C55E" },
      { key: "PENDING", label: "Pending", color: "#7C3AED" },
      { key: "FAILED", label: "Failed", color: "#F59E0B" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const EVENTS_STANDARD_TICKETING_LIVE: DashboardVariantSpec = {
  key: "events_ticketing_live",
  tier: "standard",
  appliesTo: ["events", "nightlife"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Tickets Sold",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Artist fees + venue + promotions",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const B2B_STANDARD_PIPELINE_HEAVY: DashboardVariantSpec = {
  key: "b2b_pipeline_heavy",
  tier: "standard",
  appliesTo: ["b2b"],
  theme: "light",
  kpis: [
    {
      key: "customers",
      label: "Active Clients",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Logistics + commissions",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const AUTOMOTIVE_STANDARD_DARK_PERFORMANCE: DashboardVariantSpec = {
  key: "automotive_dark_performance",
  tier: "standard",
  appliesTo: ["automotive"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Sales",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "bookings",
      label: "Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Acquisition + maintenance",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const CONTENT_STANDARD_CREATOR: DashboardVariantSpec = {
  key: "content_creator_dashboard",
  tier: "standard",
  appliesTo: ["blog_media", "creative_portfolio"],
  theme: "light",
  kpis: [
    {
      key: "customers",
      label: "Subscribers",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Posts",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Tools + production",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const NONPROFIT_STANDARD_IMPACT: DashboardVariantSpec = {
  key: "nonprofit_impact_first",
  tier: "standard",
  appliesTo: ["nonprofit"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Donations",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "customers",
      label: "Donors",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Programs",
      helperText: "Active",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Program spend + admin",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const MARKETPLACE_STANDARD_SUPPLY_DEMAND: DashboardVariantSpec = {
  key: "marketplace_supply_demand",
  tier: "standard",
  appliesTo: ["marketplace"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "GMV",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Buyers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Disputes + refunds",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const FOOD_STANDARD_OPERATIONS: DashboardVariantSpec = {
  key: "food_standard_operations",
  tier: "standard",
  appliesTo: ["food"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + delivery costs",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const DIGITAL_STANDARD_SALES: DashboardVariantSpec = {
  key: "digital_standard_sales",
  tier: "standard",
  appliesTo: ["digital"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "aov",
      label: "Average Order Value",
      helperText: "Paid orders",
      format: "currency",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Refunds + fees",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const TRAVEL_STANDARD_OCCUPANCY: DashboardVariantSpec = {
  key: "travel_standard_occupancy",
  tier: "standard",
  appliesTo: ["travel_hospitality"],
  theme: "light",
  kpis: [
    {
      key: "bookings",
      label: "Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "upcomingBookings",
      label: "Upcoming",
      helperText: "Next 7 days",
      format: "number",
    },
    {
      key: "cancellations",
      label: "Cancellations",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
  ],
  pipeline: SERVICES_STANDARD_BOOKINGS_FOCUS.pipeline,
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Refunds + platform fees",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const EDUCATION_STANDARD_GROWTH: DashboardVariantSpec = {
  key: "education_standard_growth",
  tier: "standard",
  appliesTo: ["education"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Enrollments",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Students",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: RETAIL_STANDARD_INVENTORY_FIRST.pipeline,
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Refunds + fees",
  },
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const RETAIL_ADVANCED_OPERATIONS: DashboardVariantSpec = {
  key: "retail_advanced_operations",
  tier: "advanced",
  appliesTo: ["retail", "fashion", "electronics", "grocery", "one_product"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "returnsCount",
      label: "Returns",
      helperText: "Operational",
      format: "number",
    },
    {
      key: "refundRate",
      label: "Refund Rate",
      helperText: "Refunded orders",
      format: "percent",
    },
  ],
  pipeline: {
    donutStyle: "medium",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["DELIVERED"],
      },
      {
        key: "pending",
        label: "Pending",
        color: "#3B82F6",
        statuses: [
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "FULFILLING",
          "OUT_FOR_DELIVERY",
          "SHIPPED",
        ],
      },
      {
        key: "returned",
        label: "Returned",
        color: "#A855F7",
        statuses: ["REFUND_REQUESTED", "REFUNDED"],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + delivery costs",
  },
  invoiceOverview: RETAIL_STANDARD_INVENTORY_FIRST.invoiceOverview,
  rightRail: {
    inventoryAlerts: "always",
    customerInsights: "full",
    earningsCard: "full",
  },
};

const FASHION_ADVANCED_PROFITABILITY: DashboardVariantSpec = {
  key: "fashion_advanced_profitability",
  tier: "advanced",
  appliesTo: ["fashion"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "returnsCount",
      label: "Returns",
      helperText: "Operational",
      format: "number",
    },
    {
      key: "refundRate",
      label: "Refund Rate",
      helperText: "Refunded orders",
      format: "percent",
    },
  ],
  pipeline: RETAIL_ADVANCED_OPERATIONS.pipeline,
  incomeVsExpense: RETAIL_ADVANCED_OPERATIONS.incomeVsExpense,
  invoiceOverview: FASHION_STANDARD_BRAND_GROWTH.invoiceOverview,
  rightRail: {
    inventoryAlerts: "always",
    customerInsights: "full",
    earningsCard: "full",
  },
};

const BEAUTY_ADVANCED_PROFITABILITY: DashboardVariantSpec = {
  key: "beauty_advanced_profitability",
  tier: "advanced",
  appliesTo: ["beauty"],
  theme: "light",
  kpis: FASHION_ADVANCED_PROFITABILITY.kpis,
  pipeline: RETAIL_ADVANCED_OPERATIONS.pipeline,
  incomeVsExpense: RETAIL_ADVANCED_OPERATIONS.incomeVsExpense,
  invoiceOverview: FASHION_STANDARD_BRAND_GROWTH.invoiceOverview,
  rightRail: FASHION_ADVANCED_PROFITABILITY.rightRail,
};

const EVENTS_ADVANCED_LIVE_OPS: DashboardVariantSpec = {
  key: "events_advanced_live_ops",
  tier: "advanced",
  appliesTo: ["events", "nightlife"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Tickets Sold",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "refundAmount",
      label: "Refunds",
      helperText: "Last 30 days",
      format: "currency",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: EVENTS_STANDARD_TICKETING_LIVE.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + promotions",
  },
  invoiceOverview: EVENTS_STANDARD_TICKETING_LIVE.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const B2B_ADVANCED_FINANCE: DashboardVariantSpec = {
  key: "b2b_advanced_finance",
  tier: "advanced",
  appliesTo: ["b2b"],
  theme: "light",
  kpis: [
    {
      key: "customers",
      label: "Active Clients",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "refundRate",
      label: "Refund Rate",
      helperText: "Refunded orders",
      format: "percent",
    },
  ],
  pipeline: B2B_STANDARD_PIPELINE_HEAVY.pipeline,
  incomeVsExpense: B2B_STANDARD_PIPELINE_HEAVY.incomeVsExpense,
  invoiceOverview: B2B_STANDARD_PIPELINE_HEAVY.invoiceOverview,
  rightRail: {
    inventoryAlerts: "always",
  },
};

const AUTOMOTIVE_ADVANCED_SALES: DashboardVariantSpec = {
  key: "automotive_advanced_sales",
  tier: "advanced",
  appliesTo: ["automotive"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Sales",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "refundAmount",
      label: "Refunds",
      helperText: "Last 30 days",
      format: "currency",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: AUTOMOTIVE_STANDARD_DARK_PERFORMANCE.pipeline,
  incomeVsExpense: AUTOMOTIVE_STANDARD_DARK_PERFORMANCE.incomeVsExpense,
  invoiceOverview: AUTOMOTIVE_STANDARD_DARK_PERFORMANCE.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const CONTENT_ADVANCED_CREATOR: DashboardVariantSpec = {
  key: "content_advanced_creator",
  tier: "advanced",
  appliesTo: ["blog_media", "creative_portfolio"],
  theme: "light",
  kpis: CONTENT_STANDARD_CREATOR.kpis,
  pipeline: CONTENT_STANDARD_CREATOR.pipeline,
  incomeVsExpense: CONTENT_STANDARD_CREATOR.incomeVsExpense,
  invoiceOverview: CONTENT_STANDARD_CREATOR.invoiceOverview,
  rightRail: CONTENT_STANDARD_CREATOR.rightRail,
};

const NONPROFIT_ADVANCED_IMPACT: DashboardVariantSpec = {
  key: "nonprofit_advanced_impact",
  tier: "advanced",
  appliesTo: ["nonprofit"],
  theme: "light",
  kpis: NONPROFIT_STANDARD_IMPACT.kpis,
  pipeline: NONPROFIT_STANDARD_IMPACT.pipeline,
  incomeVsExpense: NONPROFIT_STANDARD_IMPACT.incomeVsExpense,
  invoiceOverview: NONPROFIT_STANDARD_IMPACT.invoiceOverview,
  rightRail: NONPROFIT_STANDARD_IMPACT.rightRail,
};

const MARKETPLACE_ADVANCED_BALANCE: DashboardVariantSpec = {
  key: "marketplace_advanced_balance",
  tier: "advanced",
  appliesTo: ["marketplace"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "GMV",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "refundRate",
      label: "Refund Rate",
      helperText: "Refunded orders",
      format: "percent",
    },
    {
      key: "paymentSuccessRate",
      label: "Payment Success",
      helperText: "Last 30 days",
      format: "percent",
    },
  ],
  pipeline: MARKETPLACE_STANDARD_SUPPLY_DEMAND.pipeline,
  incomeVsExpense: MARKETPLACE_STANDARD_SUPPLY_DEMAND.incomeVsExpense,
  invoiceOverview: MARKETPLACE_STANDARD_SUPPLY_DEMAND.invoiceOverview,
  rightRail: {
    inventoryAlerts: "always",
  },
};

const FOOD_ADVANCED_KITCHEN_PROFITABILITY: DashboardVariantSpec = {
  key: "food_advanced_kitchen_profitability",
  tier: "advanced",
  appliesTo: ["food"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "aov",
      label: "Avg Order Value",
      helperText: "Paid orders",
      format: "currency",
    },
    {
      key: "refundRate",
      label: "Refund/Void Rate",
      helperText: "Refunded orders",
      format: "percent",
    },
  ],
  pipeline: {
    donutStyle: "medium",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["DELIVERED", "COMPLETED"],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED"],
      },
      {
        key: "refunded",
        label: "Refunded",
        color: "#A855F7",
        statuses: ["REFUND_REQUESTED", "REFUNDED"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + voided orders",
  },
  invoiceOverview: {
    source: "invoices",
    rows: [
      { key: "PAID", label: "Paid", color: "#22C55E" },
      { key: "OVERDUE", label: "Overdue", color: "#F59E0B" },
      { key: "DRAFT", label: "Draft", color: "#94A3B8" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const DIGITAL_ADVANCED_FUNNEL_CONVERSION: DashboardVariantSpec = {
  key: "digital_advanced_funnel_conversion",
  tier: "advanced",
  appliesTo: ["digital"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "paymentSuccessRate",
      label: "Conversion Rate",
      helperText: "Payment success",
      format: "percent",
    },
    {
      key: "refundRate",
      label: "Refund Rate",
      helperText: "Refunded orders",
      format: "percent",
    },
  ],
  pipeline: {
    donutStyle: "medium",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["DELIVERED", "COMPLETED"],
      },
      {
        key: "refunded",
        label: "Refunded",
        color: "#A855F7",
        statuses: ["REFUND_REQUESTED", "REFUNDED"],
      },
      {
        key: "failed",
        label: "Failed",
        color: "#EF4444",
        statuses: ["FAILED", "PAYMENT_FAILED"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "line",
    expenseDefinition: "Refunds + fees + chargebacks",
  },
  invoiceOverview: {
    source: "payments",
    rows: [
      { key: "SUCCESS", label: "Paid", color: "#22C55E" },
      { key: "PENDING", label: "Pending", color: "#7C3AED" },
      { key: "FAILED", label: "Failed", color: "#F59E0B" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const TRAVEL_ADVANCED_REVENUE_OPTIMIZATION: DashboardVariantSpec = {
  key: "travel_advanced_revenue_optimization",
  tier: "advanced",
  appliesTo: ["travel_hospitality"],
  theme: "light",
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "bookings",
      label: "Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "aov",
      label: "Avg Stay Value",
      helperText: "Per booking",
      format: "currency",
    },
    {
      key: "cancellations",
      label: "Cancellation Rate",
      helperText: "Cancelled bookings",
      format: "number",
    },
  ],
  pipeline: {
    donutStyle: "medium",
    legend: "stacked_right",
    segments: [
      {
        key: "upcoming",
        label: "Upcoming",
        color: "#3B82F6",
        statuses: ["PENDING", "CONFIRMED"],
      },
      {
        key: "completed",
        label: "Completed",
        color: "#F97316",
        statuses: ["COMPLETED"],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED", "NO_SHOW"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + platform fees",
  },
  invoiceOverview: {
    source: "invoices",
    rows: [
      { key: "PAID", label: "Paid", color: "#22C55E" },
      { key: "OVERDUE", label: "Overdue", color: "#F59E0B" },
      { key: "DRAFT", label: "Draft", color: "#94A3B8" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
  },
};

const SERVICES_ADVANCED_CAPACITY: DashboardVariantSpec = {
  key: "services_advanced_capacity",
  tier: "advanced",
  appliesTo: ["services", "education", "real_estate"],
  theme: "light",
  kpis: [
    {
      key: "bookings",
      label: "Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "completionRate",
      label: "Completion Rate",
      helperText: "Completed bookings",
      format: "percent",
    },
    {
      key: "utilizationRate",
      label: "Utilization",
      helperText: "Capacity filled",
      format: "percent",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
  ],
  pipeline: SERVICES_STANDARD_BOOKINGS_FOCUS.pipeline,
  incomeVsExpense: SERVICES_STANDARD_BOOKINGS_FOCUS.incomeVsExpense,
  invoiceOverview: SERVICES_STANDARD_BOOKINGS_FOCUS.invoiceOverview,
  rightRail: SERVICES_STANDARD_BOOKINGS_FOCUS.rightRail,
};

// Pro tier variants - Mint theme with AI features
const RETAIL_PRO_MINT_AI: DashboardVariantSpec = {
  key: "retail_pro_mint_ai",
  tier: "pro",
  appliesTo: ["retail", "fashion", "electronics", "grocery", "one_product", "beauty"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "Total Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: {
    donutStyle: "thick",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Completed",
        color: "#10B981",
        statuses: ["DELIVERED", "COMPLETED"],
      },
      {
        key: "pending",
        label: "In Progress",
        color: "#3B82F6",
        statuses: [
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "FULFILLING",
          "OUT_FOR_DELIVERY",
          "SHIPPED",
        ],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + delivery costs",
  },
  invoiceOverview: {
    source: "invoices",
    rows: [
      { key: "PAID", label: "Paid", color: "#22C55E" },
      { key: "OVERDUE", label: "Overdue", color: "#F59E0B" },
      { key: "DRAFT", label: "Draft", color: "#94A3B8" },
    ],
  },
  rightRail: {
    inventoryAlerts: "always",
    inventoryCriticalLowCount: 5,
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: {
    hasFinanceModule: true,
    hasMarketingModule: true,
    hasInvoiceOverview: true,
    hasAdvancedFilters: true,
    hasCustomerInsights: "full",
    hasInventoryAlerts: true,
    maxKpiSlots: 6,
    allowedKpis: [
      "revenue",
      "orders",
      "customers",
      "conversionRate",
      "aiConversions",
      "aiConversations",
      "aiUsage",
      "aov",
      "inventoryValue",
      "lowStockCount",
    ],
  },
};

const SERVICES_PRO_MINT_AI: DashboardVariantSpec = {
  key: "services_pro_mint_ai",
  tier: "pro",
  appliesTo: ["services", "education", "real_estate"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "bookings",
      label: "Total Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "completionRate",
      label: "Completion Rate",
      helperText: "Completed bookings",
      format: "percent",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
    {
      key: "aiUsage",
      label: "AI Usage",
      helperText: "Monthly quota",
      format: "percent",
    },
  ],
  pipeline: {
    donutStyle: "thick",
    legend: "stacked_right",
    segments: [
      {
        key: "upcoming",
        label: "Upcoming",
        color: "#10B981",
        statuses: ["PENDING", "CONFIRMED"],
      },
      {
        key: "completed",
        label: "Completed",
        color: "#3B82F6",
        statuses: ["COMPLETED"],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED", "NO_SHOW"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Staff payouts + platform fees",
  },
  invoiceOverview: {
    source: "payments",
    rows: [
      { key: "SUCCESS", label: "Paid", color: "#22C55E" },
      { key: "PENDING", label: "Pending", color: "#7C3AED" },
      { key: "FAILED", label: "Failed", color: "#F59E0B" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: {
    hasFinanceModule: true,
    hasMarketingModule: true,
    hasInvoiceOverview: true,
    hasAdvancedFilters: true,
    hasCustomerInsights: "full",
    hasInventoryAlerts: false,
    maxKpiSlots: 6,
  },
};

const EVENTS_PRO_MINT_AI: DashboardVariantSpec = {
  key: "events_pro_mint_ai",
  tier: "pro",
  appliesTo: ["events", "nightlife"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Tickets Sold",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Attendees",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: {
    donutStyle: "thick",
    legend: "stacked_right",
    segments: [
      {
        key: "completed",
        label: "Attended",
        color: "#10B981",
        statuses: ["DELIVERED", "COMPLETED"],
      },
      {
        key: "pending",
        label: "Upcoming",
        color: "#3B82F6",
        statuses: ["PAID", "CONFIRMED"],
      },
      {
        key: "cancelled",
        label: "Cancelled",
        color: "#CBD5E1",
        statuses: ["CANCELLED"],
      },
    ],
  },
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + promotions",
  },
  invoiceOverview: {
    source: "payments",
    rows: [
      { key: "SUCCESS", label: "Paid", color: "#22C55E" },
      { key: "PENDING", label: "Pending", color: "#7C3AED" },
    ],
  },
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: {
    hasFinanceModule: true,
    hasMarketingModule: true,
    hasInvoiceOverview: true,
    hasAdvancedFilters: true,
    hasCustomerInsights: "full",
    hasInventoryAlerts: false,
    maxKpiSlots: 6,
  },
};

const FOOD_PRO_MINT_AI: DashboardVariantSpec = {
  key: "food_pro_mint_ai",
  tier: "pro",
  appliesTo: ["food"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: RETAIL_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees + delivery costs",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

const TRAVEL_PRO_MINT_AI: DashboardVariantSpec = {
  key: "travel_pro_mint_ai",
  tier: "pro",
  appliesTo: ["travel_hospitality"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "bookings",
      label: "Bookings",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Guests",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: SERVICES_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + platform fees",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

const B2B_PRO_MINT_AI: DashboardVariantSpec = {
  key: "b2b_pro_mint_ai",
  tier: "pro",
  appliesTo: ["b2b"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "customers",
      label: "Active Clients",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: RETAIL_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Logistics + commissions",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: {
    inventoryAlerts: "always",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

const CONTENT_PRO_MINT_AI: DashboardVariantSpec = {
  key: "content_pro_mint_ai",
  tier: "pro",
  appliesTo: ["blog_media", "creative_portfolio"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "customers",
      label: "Subscribers",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Posts",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: RETAIL_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Tools + production",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

const NONPROFIT_PRO_MINT_AI: DashboardVariantSpec = {
  key: "nonprofit_pro_mint_ai",
  tier: "pro",
  appliesTo: ["nonprofit"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "Donations",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "customers",
      label: "Donors",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "orders",
      label: "Programs",
      helperText: "Active",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: RETAIL_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Program spend + admin",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: {
    inventoryAlerts: "hidden",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

const MARKETPLACE_PRO_MINT_AI: DashboardVariantSpec = {
  key: "marketplace_pro_mint_ai",
  tier: "pro",
  appliesTo: ["marketplace"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "GMV",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Buyers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: RETAIL_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Disputes + refunds",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: {
    inventoryAlerts: "always",
    customerInsights: "full",
    earningsCard: "full",
  },
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

const DIGITAL_PRO_MINT_AI: DashboardVariantSpec = {
  key: "digital_pro_mint_ai",
  tier: "pro",
  appliesTo: ["digital"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    {
      key: "revenue",
      label: "Revenue",
      helperText: "Paid (SUCCESS)",
      format: "currency",
    },
    {
      key: "orders",
      label: "Orders",
      helperText: "Last 30 days",
      format: "number",
    },
    {
      key: "customers",
      label: "Customers",
      helperText: "New in 30 days",
      format: "number",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      helperText: "AI + manual",
      format: "percent",
    },
    {
      key: "aiConversions",
      label: "AI Conversions",
      helperText: "Captured by AI",
      format: "number",
    },
    {
      key: "aiConversations",
      label: "AI Chats",
      helperText: "Ongoing",
      format: "number",
    },
  ],
  pipeline: RETAIL_PRO_MINT_AI.pipeline,
  incomeVsExpense: {
    chart: "area",
    expenseDefinition: "Refunds + fees",
  },
  invoiceOverview: RETAIL_PRO_MINT_AI.invoiceOverview,
  rightRail: RETAIL_PRO_MINT_AI.rightRail,
  capabilities: RETAIL_PRO_MINT_AI.capabilities,
};

export const DASHBOARD_VARIANTS: Record<string, DashboardVariantSpec> = {
  [BASIC_GLOBAL.key]: BASIC_GLOBAL,
  [RETAIL_STANDARD_INVENTORY_FIRST.key]: RETAIL_STANDARD_INVENTORY_FIRST,
  [FASHION_STANDARD_BRAND_GROWTH.key]: FASHION_STANDARD_BRAND_GROWTH,
  [BEAUTY_STANDARD_BRAND_GROWTH.key]: BEAUTY_STANDARD_BRAND_GROWTH,
  [FOOD_STANDARD_OPERATIONS.key]: FOOD_STANDARD_OPERATIONS,
  [DIGITAL_STANDARD_SALES.key]: DIGITAL_STANDARD_SALES,
  [TRAVEL_STANDARD_OCCUPANCY.key]: TRAVEL_STANDARD_OCCUPANCY,
  [EDUCATION_STANDARD_GROWTH.key]: EDUCATION_STANDARD_GROWTH,
  [RETAIL_ADVANCED_OPERATIONS.key]: RETAIL_ADVANCED_OPERATIONS,
  [FASHION_ADVANCED_PROFITABILITY.key]: FASHION_ADVANCED_PROFITABILITY,
  [BEAUTY_ADVANCED_PROFITABILITY.key]: BEAUTY_ADVANCED_PROFITABILITY,
  [FOOD_ADVANCED_KITCHEN_PROFITABILITY.key]:
    FOOD_ADVANCED_KITCHEN_PROFITABILITY,
  [DIGITAL_ADVANCED_FUNNEL_CONVERSION.key]: DIGITAL_ADVANCED_FUNNEL_CONVERSION,
  [TRAVEL_ADVANCED_REVENUE_OPTIMIZATION.key]:
    TRAVEL_ADVANCED_REVENUE_OPTIMIZATION,
  [EVENTS_ADVANCED_LIVE_OPS.key]: EVENTS_ADVANCED_LIVE_OPS,
  [B2B_ADVANCED_FINANCE.key]: B2B_ADVANCED_FINANCE,
  [AUTOMOTIVE_ADVANCED_SALES.key]: AUTOMOTIVE_ADVANCED_SALES,
  [CONTENT_ADVANCED_CREATOR.key]: CONTENT_ADVANCED_CREATOR,
  [NONPROFIT_ADVANCED_IMPACT.key]: NONPROFIT_ADVANCED_IMPACT,
  [MARKETPLACE_ADVANCED_BALANCE.key]: MARKETPLACE_ADVANCED_BALANCE,
  [SERVICES_STANDARD_BOOKINGS_FOCUS.key]: SERVICES_STANDARD_BOOKINGS_FOCUS,
  [SERVICES_ADVANCED_CAPACITY.key]: SERVICES_ADVANCED_CAPACITY,
  [EVENTS_STANDARD_TICKETING_LIVE.key]: EVENTS_STANDARD_TICKETING_LIVE,
  [B2B_STANDARD_PIPELINE_HEAVY.key]: B2B_STANDARD_PIPELINE_HEAVY,
  [AUTOMOTIVE_STANDARD_DARK_PERFORMANCE.key]:
    AUTOMOTIVE_STANDARD_DARK_PERFORMANCE,
  [CONTENT_STANDARD_CREATOR.key]: CONTENT_STANDARD_CREATOR,
  [NONPROFIT_STANDARD_IMPACT.key]: NONPROFIT_STANDARD_IMPACT,
  [MARKETPLACE_STANDARD_SUPPLY_DEMAND.key]: MARKETPLACE_STANDARD_SUPPLY_DEMAND,
  // Pro tier mint variants
  [RETAIL_PRO_MINT_AI.key]: RETAIL_PRO_MINT_AI,
  [SERVICES_PRO_MINT_AI.key]: SERVICES_PRO_MINT_AI,
  [EVENTS_PRO_MINT_AI.key]: EVENTS_PRO_MINT_AI,
  [FOOD_PRO_MINT_AI.key]: FOOD_PRO_MINT_AI,
  [TRAVEL_PRO_MINT_AI.key]: TRAVEL_PRO_MINT_AI,
  [B2B_PRO_MINT_AI.key]: B2B_PRO_MINT_AI,
  [CONTENT_PRO_MINT_AI.key]: CONTENT_PRO_MINT_AI,
  [NONPROFIT_PRO_MINT_AI.key]: NONPROFIT_PRO_MINT_AI,
  [MARKETPLACE_PRO_MINT_AI.key]: MARKETPLACE_PRO_MINT_AI,
  [DIGITAL_PRO_MINT_AI.key]: DIGITAL_PRO_MINT_AI,
};

export function defaultVariantKeyForIndustry(
  industrySlug: IndustrySlug,
  tier: DashboardPlanTier,
): string {
  if (tier === "basic") return BASIC_GLOBAL.key;

  if (tier === "pro") {
    // Pro tier uses mint theme with AI features
    if (industrySlug === "fashion" || industrySlug === "beauty")
      return RETAIL_PRO_MINT_AI.key;
    if (
      ["retail", "electronics", "grocery", "one_product"].includes(industrySlug)
    )
      return RETAIL_PRO_MINT_AI.key;
    if (industrySlug === "food") return FOOD_PRO_MINT_AI.key;
    if (industrySlug === "digital") return DIGITAL_PRO_MINT_AI.key;
    if (industrySlug === "travel_hospitality") return TRAVEL_PRO_MINT_AI.key;
    if (["services", "education", "real_estate"].includes(industrySlug))
      return SERVICES_PRO_MINT_AI.key;
    if (industrySlug === "events" || industrySlug === "nightlife")
      return EVENTS_PRO_MINT_AI.key;
    if (industrySlug === "b2b") return B2B_PRO_MINT_AI.key;
    if (industrySlug === "automotive") return RETAIL_PRO_MINT_AI.key;
    if (industrySlug === "marketplace") return MARKETPLACE_PRO_MINT_AI.key;
    if (industrySlug === "nonprofit") return NONPROFIT_PRO_MINT_AI.key;
    if (industrySlug === "blog_media" || industrySlug === "creative_portfolio")
      return CONTENT_PRO_MINT_AI.key;
    return RETAIL_PRO_MINT_AI.key;
  }

  if (tier === "advanced") {
    if (industrySlug === "fashion") return FASHION_ADVANCED_PROFITABILITY.key;
    if (industrySlug === "beauty") return BEAUTY_ADVANCED_PROFITABILITY.key;
    if (
      ["retail", "electronics", "grocery", "one_product"].includes(industrySlug)
    )
      return RETAIL_ADVANCED_OPERATIONS.key;
    if (industrySlug === "food") return FOOD_ADVANCED_KITCHEN_PROFITABILITY.key;
    if (industrySlug === "digital")
      return DIGITAL_ADVANCED_FUNNEL_CONVERSION.key;
    if (industrySlug === "travel_hospitality")
      return TRAVEL_ADVANCED_REVENUE_OPTIMIZATION.key;
    if (industrySlug === "education") return SERVICES_ADVANCED_CAPACITY.key;
    if (industrySlug === "real_estate") return SERVICES_ADVANCED_CAPACITY.key;
    if (industrySlug === "services") return SERVICES_ADVANCED_CAPACITY.key;
    if (industrySlug === "events" || industrySlug === "nightlife")
      return EVENTS_ADVANCED_LIVE_OPS.key;
    if (industrySlug === "b2b") return B2B_ADVANCED_FINANCE.key;
    if (industrySlug === "automotive") return AUTOMOTIVE_ADVANCED_SALES.key;
    if (industrySlug === "marketplace") return MARKETPLACE_ADVANCED_BALANCE.key;
    if (industrySlug === "nonprofit") return NONPROFIT_ADVANCED_IMPACT.key;
    if (industrySlug === "blog_media" || industrySlug === "creative_portfolio")
      return CONTENT_ADVANCED_CREATOR.key;
    return BASIC_GLOBAL.key;
  }

  if (industrySlug === "fashion") return FASHION_STANDARD_BRAND_GROWTH.key;
  if (industrySlug === "beauty") return BEAUTY_STANDARD_BRAND_GROWTH.key;
  if (industrySlug === "food") return FOOD_STANDARD_OPERATIONS.key;
  if (industrySlug === "digital") return DIGITAL_STANDARD_SALES.key;
  if (industrySlug === "travel_hospitality")
    return TRAVEL_STANDARD_OCCUPANCY.key;
  if (industrySlug === "education") return EDUCATION_STANDARD_GROWTH.key;

  if (["services", "education", "real_estate"].includes(industrySlug))
    return SERVICES_STANDARD_BOOKINGS_FOCUS.key;
  if (["events", "nightlife"].includes(industrySlug))
    return EVENTS_STANDARD_TICKETING_LIVE.key;
  if (industrySlug === "b2b") return B2B_STANDARD_PIPELINE_HEAVY.key;
  if (industrySlug === "automotive")
    return AUTOMOTIVE_STANDARD_DARK_PERFORMANCE.key;
  if (["blog_media", "creative_portfolio"].includes(industrySlug))
    return CONTENT_STANDARD_CREATOR.key;
  if (industrySlug === "nonprofit") return NONPROFIT_STANDARD_IMPACT.key;
  if (industrySlug === "marketplace")
    return MARKETPLACE_STANDARD_SUPPLY_DEMAND.key;

  return RETAIL_STANDARD_INVENTORY_FIRST.key;
}

export function resolveDashboardVariantSpec(input: {
  industrySlug: IndustrySlug;
  tier: DashboardPlanTier;
  dashboardCosmeticVariant?: string | null;
  storeFeatures?: { invoicesEnabled?: boolean };
}): DashboardVariantSpec {
  const fallbackKey = defaultVariantKeyForIndustry(
    input.industrySlug,
    input.tier,
  );
  const requestedKey = String(input.dashboardCosmeticVariant || "").trim();

  const requested = requestedKey ? DASHBOARD_VARIANTS[requestedKey] : undefined;
  let variant =
    requested?.tier === input.tier &&
    requested.appliesTo?.includes(input.industrySlug)
      ? requested
      : DASHBOARD_VARIANTS[fallbackKey] || RETAIL_STANDARD_INVENTORY_FIRST;

  // Fallback invoice source if invoices disabled
  if (
    variant.invoiceOverview?.source === "invoices" &&
    input.storeFeatures?.invoicesEnabled === false
  ) {
    variant = {
      ...variant,
      invoiceOverview: {
        source: "payments",
        rows: [
          { key: "SUCCESS", label: "Paid", color: "#22C55E" },
          { key: "PENDING", label: "Pending", color: "#7C3AED" },
          { key: "FAILED", label: "Failed", color: "#F59E0B" },
        ],
      },
    };
  }

  return variant;
}
