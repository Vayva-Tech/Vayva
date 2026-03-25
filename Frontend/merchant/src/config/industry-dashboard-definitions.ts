import type { IndustrySlug } from "@/lib/templates/types";

// ---------------------------------------------------------------------------
// Industry-Native Dashboard Definitions
//
// This layer sits *above* dashboard-variants.ts (which handles KPI slots and
// tier cosmetics) and defines the **business-native sections** that make a
// merchant feel "this was built for me."
//
// Each definition follows the 6-part mental model from
// docs/INDUSTRY_NATIVE_DASHBOARDS.md:
//   1. Core Job
//   2. Primary Object
//   3. Dashboard Goal (Today)
//   4. Top Dashboard Sections
//   5. Module Emphasis
//   6. Failure Modes the Dashboard Prevents
// ---------------------------------------------------------------------------

export type IndustryDashboardSectionKey =
  | "primary_object_health"
  | "live_operations"
  | "decision_kpis"
  | "bottlenecks_alerts"
  | "suggested_actions";

export type DashboardTimeHorizon = "now" | "today" | "week" | "month";

export interface SuggestedActionRule {
  id: string;
  title: string;
  reason: string;
  conditionKey: string;
  severity: "critical" | "warning" | "info";
  href: string;
  icon: string;
}

export interface AlertThreshold {
  key: string;
  label: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  value: number;
  severity: "critical" | "warning" | "info";
  message: string;
}

export interface PrimaryObjectHealthField {
  key: string;
  label: string;
  format: "number" | "currency" | "percent" | "list";
  icon?: string;
}

export interface LiveOpsField {
  key: string;
  label: string;
  format: "number" | "currency" | "duration" | "list";
  icon?: string;
  emptyText?: string;
}

export interface IndustryDashboardDefinition {
  industry: IndustrySlug;
  title: string;
  subtitle: string;
  primaryObjectLabel: string;
  defaultTimeHorizon: DashboardTimeHorizon;
  sections: IndustryDashboardSectionKey[];

  primaryObjectHealth: PrimaryObjectHealthField[];
  liveOps: LiveOpsField[];
  alertThresholds: AlertThreshold[];
  suggestedActionRules: SuggestedActionRule[];

  failureModes: string[];
}

// ---------------------------------------------------------------------------
// Phase 1 Definitions: Retail, Food, Services
// ---------------------------------------------------------------------------

const RETAIL_DASHBOARD: IndustryDashboardDefinition = {
  industry: "retail",
  title: "Retail Operations",
  subtitle: "Move the right inventory without stockouts or dead stock",
  primaryObjectLabel: "Product",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topSellingProducts",
      label: "Top Selling Today",
      format: "list",
      icon: "TrendingUp",
    },
    {
      key: "lowStockProducts",
      label: "Low Stock",
      format: "list",
      icon: "AlertTriangle",
    },
    {
      key: "deadStockProducts",
      label: "Not Selling (14d)",
      format: "list",
      icon: "PackageX",
    },
  ],

  liveOps: [
    {
      key: "pendingFulfillment",
      label: "Awaiting Fulfillment",
      format: "number",
      icon: "Package",
      emptyText: "All orders fulfilled",
    },
    {
      key: "delayedShipments",
      label: "Shipments Delayed",
      format: "number",
      icon: "Clock",
      emptyText: "No delays",
    },
    {
      key: "returnsInitiated",
      label: "Returns Initiated",
      format: "number",
      icon: "RotateCcw",
      emptyText: "No returns",
    },
  ],

  alertThresholds: [
    {
      key: "lowStockCount",
      label: "Low Stock Alert",
      operator: "gte",
      value: 1,
      severity: "warning",
      message: "{count} products below restock threshold",
    },
    {
      key: "outOfStockCount",
      label: "Out of Stock",
      operator: "gte",
      value: 1,
      severity: "critical",
      message: "{count} products out of stock",
    },
    {
      key: "delayedShipments",
      label: "Fulfillment Delays",
      operator: "gte",
      value: 1,
      severity: "warning",
      message: "{count} shipments delayed",
    },
    {
      key: "highReturnRateProducts",
      label: "High Return Rate",
      operator: "gte",
      value: 1,
      severity: "info",
      message: "{count} products with high return rate",
    },
  ],

  suggestedActionRules: [
    {
      id: "restock",
      title: "Restock low items",
      reason: "Prevents stockouts and lost sales",
      conditionKey: "hasLowStock",
      severity: "warning",
      href: "/dashboard/products?filter=low_stock",
      icon: "PackagePlus",
    },
    {
      id: "discount_dead",
      title: "Discount slow movers",
      reason: "Free up capital from dead stock",
      conditionKey: "hasDeadStock",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "BadgePercent",
    },
    {
      id: "fulfill_pending",
      title: "Fulfill pending orders",
      reason: "Customers are waiting",
      conditionKey: "hasPendingFulfillment",
      severity: "critical",
      href: "/dashboard/fulfillment/shipments",
      icon: "Truck",
    },
  ],

  failureModes: ["Stockouts", "Overstocking", "Margin blindness"],
};

const FOOD_DASHBOARD: IndustryDashboardDefinition = {
  industry: "food",
  title: "Kitchen Control",
  subtitle: "Keep prep time low and orders flowing",
  primaryObjectLabel: "Menu Item",
  defaultTimeHorizon: "now",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "bestSellingItems",
      label: "Best Sellers Today",
      format: "list",
      icon: "Flame",
    },
    {
      key: "soldOutItems",
      label: "Sold Out / Paused",
      format: "list",
      icon: "CircleOff",
    },
  ],

  liveOps: [
    {
      key: "ordersInQueue",
      label: "Orders in Queue",
      format: "number",
      icon: "ClipboardList",
      emptyText: "Queue clear",
    },
    {
      key: "avgPrepTime",
      label: "Avg Prep Time",
      format: "duration",
      icon: "Timer",
      emptyText: "—",
    },
    {
      key: "kitchenBacklog",
      label: "Kitchen Backlog",
      format: "number",
      icon: "AlertTriangle",
      emptyText: "No backlog",
    },
  ],

  alertThresholds: [
    {
      key: "prepTimeSpikeMinutes",
      label: "Prep Time Spike",
      operator: "gte",
      value: 30,
      severity: "critical",
      message: "Average prep time is {value}min — above 30min SLA",
    },
    {
      key: "soldOutCount",
      label: "Sold Out Items",
      operator: "gte",
      value: 1,
      severity: "warning",
      message: "{count} items sold out",
    },
    {
      key: "ordersInQueue",
      label: "Order Pileup",
      operator: "gte",
      value: 10,
      severity: "critical",
      message: "{count} orders queued — kitchen may be overloaded",
    },
  ],

  suggestedActionRules: [
    {
      id: "pause_soldout",
      title: "Pause sold-out items",
      reason: "Prevent customer disappointment",
      conditionKey: "hasSoldOutItems",
      severity: "warning",
      href: "/dashboard/menu-items?filter=sold_out",
      icon: "CircleOff",
    },
    {
      id: "clear_backlog",
      title: "Clear order backlog",
      reason: "Customers waiting too long",
      conditionKey: "hasBacklog",
      severity: "critical",
      href: "/dashboard/kitchen",
      icon: "ChefHat",
    },
    {
      id: "add_staff",
      title: "Consider adding staff",
      reason: "Prep time exceeding SLA",
      conditionKey: "hasPrepTimeSpike",
      severity: "info",
      href: "/dashboard/settings/profile",
      icon: "UserPlus",
    },
  ],

  failureModes: ["Kitchen chaos", "Late orders", "Bad customer experience"],
};

const SERVICES_DASHBOARD: IndustryDashboardDefinition = {
  industry: "services",
  title: "Bookings & Calendar",
  subtitle: "Fill calendar capacity profitably",
  primaryObjectLabel: "Service",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topBookedServices",
      label: "Top Booked",
      format: "list",
      icon: "Star",
    },
    {
      key: "underperformingServices",
      label: "Underperforming",
      format: "list",
      icon: "TrendingDown",
    },
  ],

  liveOps: [
    {
      key: "todaysBookings",
      label: "Today's Bookings",
      format: "number",
      icon: "Calendar",
      emptyText: "No bookings today",
    },
    {
      key: "cancellationsToday",
      label: "Cancellations",
      format: "number",
      icon: "XCircle",
      emptyText: "No cancellations",
    },
    {
      key: "noShowsToday",
      label: "No-Shows",
      format: "number",
      icon: "UserX",
      emptyText: "No no-shows",
    },
  ],

  alertThresholds: [
    {
      key: "emptySlotsNextDay",
      label: "Empty Slots Tomorrow",
      operator: "gte",
      value: 3,
      severity: "warning",
      message: "{count} empty slots tomorrow",
    },
    {
      key: "noShowRate",
      label: "High No-Show Risk",
      operator: "gte",
      value: 15,
      severity: "warning",
      message: "No-show rate at {value}% — consider reminders",
    },
  ],

  suggestedActionRules: [
    {
      id: "open_availability",
      title: "Add availability",
      reason: "Fill empty calendar slots",
      conditionKey: "hasEmptySlots",
      severity: "info",
      href: "/dashboard/bookings",
      icon: "CalendarPlus",
    },
    {
      id: "send_reminders",
      title: "Send booking reminders",
      reason: "Reduce no-show rate",
      conditionKey: "hasHighNoShowRisk",
      severity: "warning",
      href: "/dashboard/marketing/discounts",
      icon: "Bell",
    },
    {
      id: "promote_service",
      title: "Promote underperforming service",
      reason: "Increase utilization",
      conditionKey: "hasUnderperformingServices",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Megaphone",
    },
  ],

  failureModes: ["Idle time", "Revenue leakage", "Calendar gaps"],
};

// ---------------------------------------------------------------------------
// Phase 2 Definitions: B2B, Events, Nightlife, Automotive, Travel
// ---------------------------------------------------------------------------

const B2B_DASHBOARD: IndustryDashboardDefinition = {
  industry: "b2b",
  title: "Wholesale Pipeline",
  subtitle: "Convert quotes to orders and retain key accounts",
  primaryObjectLabel: "Quote / Order",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topClients",
      label: "Top Clients (30d)",
      format: "list",
      icon: "Building2",
    },
    {
      key: "pendingQuotes",
      label: "Pending Quotes",
      format: "list",
      icon: "FileText",
    },
  ],

  liveOps: [
    {
      key: "pendingQuotesCount",
      label: "Quotes Awaiting Response",
      format: "number",
      icon: "FileText",
      emptyText: "No pending quotes",
    },
    {
      key: "pendingFulfillment",
      label: "Awaiting Fulfillment",
      format: "number",
      icon: "Package",
      emptyText: "All fulfilled",
    },
    {
      key: "overdueInvoices",
      label: "Overdue Invoices",
      format: "number",
      icon: "AlertTriangle",
      emptyText: "None overdue",
    },
  ],

  alertThresholds: [
    {
      key: "pendingQuotesCount",
      label: "Stale Quotes",
      operator: "gte",
      value: 5,
      severity: "warning",
      message: "{count} quotes awaiting response — clients may lose interest",
    },
    {
      key: "overdueInvoices",
      label: "Overdue Invoices",
      operator: "gte",
      value: 1,
      severity: "critical",
      message: "{count} invoices overdue — cash flow at risk",
    },
  ],

  suggestedActionRules: [
    {
      id: "follow_up_quotes",
      title: "Follow up on stale quotes",
      reason: "Prevent deal loss from inaction",
      conditionKey: "hasStaleQuotes",
      severity: "warning",
      href: "/dashboard/quotes",
      icon: "MessageSquare",
    },
    {
      id: "fulfill_pending",
      title: "Fulfill pending orders",
      reason: "Key accounts expect timely delivery",
      conditionKey: "hasPendingFulfillment",
      severity: "critical",
      href: "/dashboard/fulfillment/shipments",
      icon: "Truck",
    },
    {
      id: "chase_invoices",
      title: "Chase overdue invoices",
      reason: "Protect cash flow",
      conditionKey: "hasOverdueInvoices",
      severity: "critical",
      href: "/dashboard/finance",
      icon: "Receipt",
    },
  ],

  failureModes: [
    "Deal loss from slow response",
    "Cash flow gaps",
    "Key account churn",
  ],
};

const EVENTS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "events",
  title: "Event Command Center",
  subtitle: "Sell out events and run smooth check-ins",
  primaryObjectLabel: "Event",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "activeEvents",
      label: "Active Events",
      format: "list",
      icon: "PartyPopper",
    },
    {
      key: "ticketsSoldToday",
      label: "Tickets Sold Today",
      format: "number",
      icon: "Ticket",
    },
  ],

  liveOps: [
    {
      key: "checkedInToday",
      label: "Checked In",
      format: "number",
      icon: "UserCheck",
      emptyText: "No check-ins yet",
    },
    {
      key: "ticketsRemaining",
      label: "Tickets Remaining",
      format: "number",
      icon: "Ticket",
      emptyText: "Sold out",
    },
    {
      key: "pendingFulfillment",
      label: "Pending Orders",
      format: "number",
      icon: "ShoppingBag",
      emptyText: "All processed",
    },
  ],

  alertThresholds: [
    {
      key: "ticketsRemaining",
      label: "Low Ticket Inventory",
      operator: "lte",
      value: 10,
      severity: "warning",
      message:
        "Only {count} tickets remaining — consider closing sales or adding capacity",
    },
    {
      key: "eventStartingSoon",
      label: "Event Starting Soon",
      operator: "gte",
      value: 1,
      severity: "info",
      message: "{count} event(s) starting within 24 hours",
    },
  ],

  suggestedActionRules: [
    {
      id: "promote_event",
      title: "Boost ticket sales",
      reason: "Unsold tickets for upcoming event",
      conditionKey: "hasUnsoldTickets",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Megaphone",
    },
    {
      id: "prep_checkin",
      title: "Prepare check-in",
      reason: "Event starting soon",
      conditionKey: "hasEventStartingSoon",
      severity: "warning",
      href: "/dashboard/check-in",
      icon: "ScanLine",
    },
  ],

  failureModes: [
    "Unsold inventory",
    "Check-in chaos",
    "Revenue leakage from no-shows",
  ],
};

const NIGHTLIFE_DASHBOARD: IndustryDashboardDefinition = {
  ...EVENTS_DASHBOARD,
  industry: "nightlife",
  title: "Nightlife Operations",
  subtitle: "Maximize door revenue and table reservations",
  primaryObjectLabel: "Event / Night",

  liveOps: [
    {
      key: "checkedInToday",
      label: "Checked In Tonight",
      format: "number",
      icon: "UserCheck",
      emptyText: "No check-ins yet",
    },
    {
      key: "ticketsRemaining",
      label: "Tickets Left",
      format: "number",
      icon: "Ticket",
      emptyText: "Sold out",
    },
    {
      key: "todaysBookings",
      label: "Table Reservations",
      format: "number",
      icon: "Armchair",
      emptyText: "No reservations",
    },
  ],

  suggestedActionRules: [
    ...EVENTS_DASHBOARD.suggestedActionRules,
    {
      id: "confirm_reservations",
      title: "Confirm table reservations",
      reason: "Reduce no-shows for tonight",
      conditionKey: "hasTodaysBookings",
      severity: "info",
      href: "/dashboard/bookings",
      icon: "Phone",
    },
  ],

  failureModes: ["Empty venue", "Reservation no-shows", "Door revenue loss"],
};

const AUTOMOTIVE_DASHBOARD: IndustryDashboardDefinition = {
  industry: "automotive",
  title: "Showroom Performance",
  subtitle: "Move inventory and convert test drives to sales",
  primaryObjectLabel: "Vehicle",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topSellingProducts",
      label: "Most Viewed Vehicles",
      format: "list",
      icon: "Car",
    },
    {
      key: "agingInventory",
      label: "Aging Inventory (30d+)",
      format: "list",
      icon: "Clock",
    },
  ],

  liveOps: [
    {
      key: "todaysBookings",
      label: "Test Drives Today",
      format: "number",
      icon: "Calendar",
      emptyText: "No test drives",
    },
    {
      key: "pendingFulfillment",
      label: "Pending Deliveries",
      format: "number",
      icon: "Truck",
      emptyText: "All delivered",
    },
    {
      key: "activeListings",
      label: "Active Listings",
      format: "number",
      icon: "Car",
      emptyText: "No listings",
    },
  ],

  alertThresholds: [
    {
      key: "agingInventoryCount",
      label: "Aging Inventory",
      operator: "gte",
      value: 3,
      severity: "warning",
      message: "{count} vehicles listed 30+ days — consider price adjustment",
    },
    {
      key: "noTestDrivesThisWeek",
      label: "No Test Drives",
      operator: "gte",
      value: 1,
      severity: "info",
      message: "No test drives scheduled this week",
    },
  ],

  suggestedActionRules: [
    {
      id: "discount_aging",
      title: "Adjust pricing on aging stock",
      reason: "Vehicles sitting 30+ days lose value",
      conditionKey: "hasAgingInventory",
      severity: "warning",
      href: "/dashboard/products",
      icon: "BadgePercent",
    },
    {
      id: "promote_vehicles",
      title: "Promote slow-moving vehicles",
      reason: "Increase showroom traffic",
      conditionKey: "hasAgingInventory",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Megaphone",
    },
    {
      id: "follow_up_drives",
      title: "Follow up on test drives",
      reason: "Convert interest to sales",
      conditionKey: "hasRecentTestDrives",
      severity: "info",
      href: "/dashboard/bookings",
      icon: "Phone",
    },
  ],

  failureModes: [
    "Aging inventory",
    "Low showroom traffic",
    "Poor test-drive-to-sale conversion",
  ],
};

const TRAVEL_DASHBOARD: IndustryDashboardDefinition = {
  industry: "travel_hospitality",
  title: "Property & Bookings",
  subtitle: "Maximize occupancy and guest satisfaction",
  primaryObjectLabel: "Room / Property",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topBookedServices",
      label: "Most Booked Rooms",
      format: "list",
      icon: "Bed",
    },
    {
      key: "vacantRooms",
      label: "Vacant Tonight",
      format: "number",
      icon: "DoorOpen",
    },
  ],

  liveOps: [
    {
      key: "todaysBookings",
      label: "Check-ins Today",
      format: "number",
      icon: "LogIn",
      emptyText: "No check-ins",
    },
    {
      key: "cancellationsToday",
      label: "Cancellations",
      format: "number",
      icon: "XCircle",
      emptyText: "No cancellations",
    },
    {
      key: "checkoutsToday",
      label: "Check-outs Today",
      format: "number",
      icon: "LogOut",
      emptyText: "No check-outs",
    },
  ],

  alertThresholds: [
    {
      key: "emptySlotsNextDay",
      label: "Low Occupancy Tomorrow",
      operator: "gte",
      value: 3,
      severity: "warning",
      message: "{count} rooms vacant tomorrow — consider last-minute deals",
    },
    {
      key: "noShowRate",
      label: "High No-Show Rate",
      operator: "gte",
      value: 10,
      severity: "warning",
      message: "No-show rate at {value}% — consider overbooking buffer",
    },
  ],

  suggestedActionRules: [
    {
      id: "last_minute_deal",
      title: "Create last-minute deal",
      reason: "Fill vacant rooms for tomorrow",
      conditionKey: "hasEmptySlots",
      severity: "warning",
      href: "/dashboard/marketing/discounts",
      icon: "BadgePercent",
    },
    {
      id: "send_reminders",
      title: "Send check-in reminders",
      reason: "Reduce no-show rate",
      conditionKey: "hasHighNoShowRisk",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Bell",
    },
    {
      id: "upsell_guests",
      title: "Upsell current guests",
      reason: "Increase revenue per stay",
      conditionKey: "hasTodaysBookings",
      severity: "info",
      href: "/dashboard/bookings",
      icon: "Sparkles",
    },
  ],

  failureModes: [
    "Low occupancy",
    "Revenue per room decline",
    "Guest dissatisfaction",
  ],
};

// ---------------------------------------------------------------------------
// Phase 3 Definitions: Digital, Nonprofit, Education, Blog/Media, Portfolio, Marketplace
// ---------------------------------------------------------------------------

const DIGITAL_DASHBOARD: IndustryDashboardDefinition = {
  industry: "digital",
  title: "Digital Products",
  subtitle: "Maximize downloads and recurring revenue",
  primaryObjectLabel: "Digital Asset",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topSellingProducts",
      label: "Top Downloads",
      format: "list",
      icon: "Download",
    },
    {
      key: "lowPerformingAssets",
      label: "Low Performers",
      format: "list",
      icon: "TrendingDown",
    },
  ],

  liveOps: [
    {
      key: "salesToday",
      label: "Sales Today",
      format: "number",
      icon: "ShoppingBag",
      emptyText: "No sales yet",
    },
    {
      key: "activeAssets",
      label: "Active Assets",
      format: "number",
      icon: "FileText",
      emptyText: "No assets",
    },
    {
      key: "pendingFulfillment",
      label: "Pending Deliveries",
      format: "number",
      icon: "Mail",
      emptyText: "All delivered",
    },
  ],

  alertThresholds: [
    {
      key: "refundRate",
      label: "High Refund Rate",
      operator: "gte",
      value: 10,
      severity: "warning",
      message: "Refund rate at {value}% — review product quality",
    },
  ],

  suggestedActionRules: [
    {
      id: "promote_asset",
      title: "Promote top asset",
      reason: "Capitalize on momentum",
      conditionKey: "hasTopSellers",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Megaphone",
    },
    {
      id: "bundle_products",
      title: "Create a bundle",
      reason: "Increase average order value",
      conditionKey: "hasMultipleAssets",
      severity: "info",
      href: "/dashboard/digital-assets/new",
      icon: "Package",
    },
  ],

  failureModes: [
    "Low conversion",
    "High refund rate",
    "Single-product dependency",
  ],
};

const NONPROFIT_DASHBOARD: IndustryDashboardDefinition = {
  industry: "nonprofit",
  title: "Impact Dashboard",
  subtitle: "Grow donations and demonstrate impact",
  primaryObjectLabel: "Campaign",
  defaultTimeHorizon: "month",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topCampaigns",
      label: "Top Campaigns",
      format: "list",
      icon: "Heart",
    },
    {
      key: "recurringDonors",
      label: "Recurring Donors",
      format: "number",
      icon: "Repeat",
    },
  ],

  liveOps: [
    {
      key: "donationsToday",
      label: "Donations Today",
      format: "number",
      icon: "Heart",
      emptyText: "No donations yet",
    },
    {
      key: "newDonors",
      label: "New Donors (7d)",
      format: "number",
      icon: "UserPlus",
      emptyText: "No new donors",
    },
    {
      key: "activeCampaigns",
      label: "Active Campaigns",
      format: "number",
      icon: "Flag",
      emptyText: "No campaigns",
    },
  ],

  alertThresholds: [
    {
      key: "donorChurnRate",
      label: "Donor Churn",
      operator: "gte",
      value: 20,
      severity: "warning",
      message: "Donor churn at {value}% — consider retention outreach",
    },
    {
      key: "campaignEndingSoon",
      label: "Campaign Ending",
      operator: "gte",
      value: 1,
      severity: "info",
      message: "{count} campaign(s) ending within 7 days",
    },
  ],

  suggestedActionRules: [
    {
      id: "thank_donors",
      title: "Send thank-you messages",
      reason: "Retain donors and build loyalty",
      conditionKey: "hasRecentDonors",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Mail",
    },
    {
      id: "launch_campaign",
      title: "Launch new campaign",
      reason: "No active campaigns running",
      conditionKey: "hasNoCampaigns",
      severity: "warning",
      href: "/dashboard/campaigns/new",
      icon: "Rocket",
    },
  ],

  failureModes: ["Donor fatigue", "Campaign stagnation", "Impact invisibility"],
};

const EDUCATION_DASHBOARD: IndustryDashboardDefinition = {
  industry: "education",
  title: "Learning Hub",
  subtitle: "Grow enrollments and improve completion rates",
  primaryObjectLabel: "Course",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topCourses",
      label: "Top Courses",
      format: "list",
      icon: "GraduationCap",
    },
    {
      key: "lowCompletionCourses",
      label: "Low Completion",
      format: "list",
      icon: "TrendingDown",
    },
  ],

  liveOps: [
    {
      key: "todaysBookings",
      label: "Enrollments Today",
      format: "number",
      icon: "UserPlus",
      emptyText: "No enrollments",
    },
    {
      key: "activeLearners",
      label: "Active Learners",
      format: "number",
      icon: "Users",
      emptyText: "No active learners",
    },
    {
      key: "cancellationsToday",
      label: "Cancellations",
      format: "number",
      icon: "XCircle",
      emptyText: "No cancellations",
    },
  ],

  alertThresholds: [
    {
      key: "lowCompletionRate",
      label: "Low Completion Rate",
      operator: "lte",
      value: 40,
      severity: "warning",
      message: "Completion rate at {value}% — review course content",
    },
    {
      key: "emptySlotsNextDay",
      label: "Empty Slots",
      operator: "gte",
      value: 5,
      severity: "info",
      message: "{count} empty slots in upcoming sessions",
    },
  ],

  suggestedActionRules: [
    {
      id: "improve_course",
      title: "Review low-completion course",
      reason: "Students dropping off",
      conditionKey: "hasLowCompletionCourses",
      severity: "warning",
      href: "/dashboard/services",
      icon: "BookOpen",
    },
    {
      id: "promote_course",
      title: "Promote upcoming sessions",
      reason: "Fill empty enrollment slots",
      conditionKey: "hasEmptySlots",
      severity: "info",
      href: "/dashboard/marketing/discounts",
      icon: "Megaphone",
    },
  ],

  failureModes: ["Low enrollment", "High dropout", "Poor completion rates"],
};

const BLOG_MEDIA_DASHBOARD: IndustryDashboardDefinition = {
  industry: "blog_media",
  title: "Content Studio",
  subtitle: "Publish consistently and grow your audience",
  primaryObjectLabel: "Post",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "publishedPosts",
      label: "Published Posts",
      format: "number",
      icon: "FileText",
    },
    { key: "draftPosts", label: "Drafts", format: "number", icon: "PenLine" },
  ],

  liveOps: [
    {
      key: "postsThisWeek",
      label: "Posts This Week",
      format: "number",
      icon: "FileText",
      emptyText: "No posts yet",
    },
    {
      key: "subscriberCount",
      label: "Subscribers",
      format: "number",
      icon: "Users",
      emptyText: "No subscribers",
    },
    {
      key: "salesToday",
      label: "Sales Today",
      format: "number",
      icon: "ShoppingBag",
      emptyText: "No sales",
    },
  ],

  alertThresholds: [
    {
      key: "daysSinceLastPost",
      label: "Publishing Gap",
      operator: "gte",
      value: 7,
      severity: "warning",
      message: "{count} days since last post — consistency matters",
    },
  ],

  suggestedActionRules: [
    {
      id: "publish_draft",
      title: "Publish a draft",
      reason: "Keep your audience engaged",
      conditionKey: "hasDraftPosts",
      severity: "info",
      href: "/dashboard/posts",
      icon: "Send",
    },
    {
      id: "monetize_content",
      title: "Add product links to posts",
      reason: "Convert readers to buyers",
      conditionKey: "hasPublishedPosts",
      severity: "info",
      href: "/dashboard/posts",
      icon: "Link",
    },
  ],

  failureModes: [
    "Inconsistent publishing",
    "Audience stagnation",
    "Low monetization",
  ],
};

const CREATIVE_PORTFOLIO_DASHBOARD: IndustryDashboardDefinition = {
  ...BLOG_MEDIA_DASHBOARD,
  industry: "creative_portfolio",
  title: "Portfolio & Commissions",
  subtitle: "Showcase work and convert inquiries to commissions",
  primaryObjectLabel: "Project",

  liveOps: [
    {
      key: "activeProjects",
      label: "Active Projects",
      format: "number",
      icon: "Palette",
      emptyText: "No projects",
    },
    {
      key: "pendingInquiries",
      label: "Pending Inquiries",
      format: "number",
      icon: "MessageSquare",
      emptyText: "No inquiries",
    },
    {
      key: "salesToday",
      label: "Sales Today",
      format: "number",
      icon: "ShoppingBag",
      emptyText: "No sales",
    },
  ],

  suggestedActionRules: [
    {
      id: "respond_inquiries",
      title: "Respond to inquiries",
      reason: "Convert interest to commissions",
      conditionKey: "hasPendingInquiries",
      severity: "warning",
      href: "/dashboard/projects",
      icon: "MessageSquare",
    },
    {
      id: "update_portfolio",
      title: "Update portfolio",
      reason: "Showcase recent work",
      conditionKey: "hasCompletedProjects",
      severity: "info",
      href: "/dashboard/projects/new",
      icon: "ImagePlus",
    },
  ],

  failureModes: ["Stale portfolio", "Missed inquiries", "Underpricing"],
};

const MARKETPLACE_DASHBOARD: IndustryDashboardDefinition = {
  industry: "marketplace",
  title: "Marketplace Operations",
  subtitle: "Grow GMV and maintain seller quality",
  primaryObjectLabel: "Listing",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "topSellingProducts",
      label: "Top Listings",
      format: "list",
      icon: "TrendingUp",
    },
    {
      key: "lowStockProducts",
      label: "Low Stock Listings",
      format: "list",
      icon: "AlertTriangle",
    },
  ],

  liveOps: [
    {
      key: "pendingFulfillment",
      label: "Pending Fulfillment",
      format: "number",
      icon: "Package",
      emptyText: "All fulfilled",
    },
    {
      key: "activeListings",
      label: "Active Listings",
      format: "number",
      icon: "Store",
      emptyText: "No listings",
    },
    {
      key: "disputesOpen",
      label: "Open Disputes",
      format: "number",
      icon: "ShieldAlert",
      emptyText: "No disputes",
    },
  ],

  alertThresholds: [
    {
      key: "disputesOpen",
      label: "Open Disputes",
      operator: "gte",
      value: 1,
      severity: "critical",
      message: "{count} open disputes — resolve promptly",
    },
    {
      key: "lowStockCount",
      label: "Low Stock",
      operator: "gte",
      value: 3,
      severity: "warning",
      message: "{count} listings running low on stock",
    },
  ],

  suggestedActionRules: [
    {
      id: "resolve_disputes",
      title: "Resolve open disputes",
      reason: "Protect seller reputation",
      conditionKey: "hasDisputes",
      severity: "critical",
      href: "/dashboard/orders",
      icon: "ShieldAlert",
    },
    {
      id: "restock_listings",
      title: "Restock low listings",
      reason: "Prevent lost sales",
      conditionKey: "hasLowStock",
      severity: "warning",
      href: "/dashboard/products?filter=low_stock",
      icon: "PackagePlus",
    },
  ],

  failureModes: [
    "Dispute escalation",
    "Seller quality decline",
    "GMV stagnation",
  ],
};

// ---------------------------------------------------------------------------
// Meal Kit Dashboard
// ---------------------------------------------------------------------------

/** Exported for meal-kit verticals; merged into `food` routing where applicable. */
export const MEAL_KIT_DASHBOARD: IndustryDashboardDefinition = {
  industry: "meal-kit",
  title: "Meal Kit Command Center",
  subtitle: "Fresh ingredients, zero waste, happy subscribers",
  primaryObjectLabel: "Subscription Box",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  primaryObjectHealth: [
    {
      key: "activeSubscriptions",
      label: "Active Subscriptions",
      format: "number",
      icon: "Users",
    },
    {
      key: "weeklyMealSelections",
      label: "Meals Selected This Week",
      format: "percent",
      icon: "CheckCircle",
    },
    {
      key: "upcomingDeliveries",
      label: "Scheduled Deliveries",
      format: "list",
      icon: "Truck",
    },
  ],

  liveOps: [
    {
      key: "pendingDeliveries",
      label: "Out for Delivery",
      format: "number",
      icon: "Package",
      emptyText: "No deliveries today",
    },
    {
      key: "recipeSelectionDeadline",
      label: "Selection Deadline",
      format: "duration",
      icon: "Clock",
      emptyText: "No deadline",
    },
    {
      key: "ingredientShortages",
      label: "Ingredient Alerts",
      format: "number",
      icon: "AlertTriangle",
      emptyText: "All ingredients stocked",
    },
    {
      key: "subscriptionRenewals",
      label: "Renewals This Week",
      format: "number",
      icon: "RefreshCw",
      emptyText: "No renewals",
    },
  ],

  alertThresholds: [
    {
      key: "lowIngredientCount",
      label: "Low Ingredients",
      operator: "gte",
      value: 3,
      severity: "warning",
      message: "{count} ingredients running low for next week's recipes",
    },
    {
      key: "unselectedMeals",
      label: "Unselected Meals",
      operator: "gt",
      value: 0,
      severity: "info",
      message: "{count} customers haven't selected meals yet",
    },
    {
      key: "deliveryDelayRisk",
      label: "Delivery Delay Risk",
      operator: "gte",
      value: 1,
      severity: "critical",
      message: "{count} deliveries at risk of delay",
    },
  ],

  suggestedActionRules: [
    {
      id: "send_reminder",
      title: "Send meal selection reminder",
      reason: "Deadline approaching for unsubscribed customers",
      conditionKey: "hasUnselectedMeals",
      severity: "info",
      href: "/dashboard/marketing/email",
      icon: "Mail",
    },
    {
      id: "adjust_portions",
      title: "Adjust portion planning",
      reason: "Ingredient surplus detected",
      conditionKey: "hasIngredientSurplus",
      severity: "warning",
      href: "/dashboard/kitchen/inventory",
      icon: "Scale",
    },
    {
      id: "restock_ingredients",
      title: "Restock critical ingredients",
      reason: "Running low on recipe essentials",
      conditionKey: "hasLowIngredients",
      severity: "warning",
      href: "/dashboard/inventory",
      icon: "PackagePlus",
    },
  ],

  failureModes: [
    "Missed delivery windows",
    "Ingredient spoilage",
    "Subscription churn from poor variety",
    "Over-portioning waste",
  ],
};

// ---------------------------------------------------------------------------
// Phase 4+ Definitions: SaaS, Legal, Healthcare, Fitness/Wellness, Jobs, etc.
// ---------------------------------------------------------------------------

const ANALYTICS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "analytics",
  title: "Analytics & Reporting",
  subtitle: "Turn metrics into decisions",
  primaryObjectLabel: "Report",
  defaultTimeHorizon: "week",
  sections: [
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
    "primary_object_health",
    "live_operations",
  ],
  primaryObjectHealth: [
    { key: "activeReports", label: "Active Reports", format: "number", icon: "FileText" },
    { key: "connectedSources", label: "Connected Sources", format: "number", icon: "Database" },
  ],
  liveOps: [
    { key: "queriesToday", label: "Queries Today", format: "number", icon: "Activity", emptyText: "—" },
    { key: "dataFreshness", label: "Data Freshness", format: "duration", icon: "Clock", emptyText: "—" },
  ],
  alertThresholds: [
    {
      key: "dataFreshnessMinutes",
      label: "Stale Data",
      operator: "gte",
      value: 180,
      severity: "warning",
      message: "Data is stale ({value}min) — check connectors",
    },
  ],
  suggestedActionRules: [
    {
      id: "view_analytics",
      title: "Review analytics",
      reason: "Spot trends and anomalies early",
      conditionKey: "hasMetrics",
      severity: "info",
      href: "/dashboard/analytics",
      icon: "BarChart3",
    },
    {
      id: "export_report",
      title: "Export a report",
      reason: "Share performance with your team",
      conditionKey: "hasReports",
      severity: "info",
      href: "/dashboard/reports",
      icon: "Download",
    },
  ],
  failureModes: ["Metric blindness", "Stale data", "Delayed decisions"],
};

const SAAS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "saas",
  title: "SaaS Control Center",
  subtitle: "Reduce churn and grow MRR",
  primaryObjectLabel: "Tenant",
  defaultTimeHorizon: "week",
  sections: [
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
    "live_operations",
    "primary_object_health",
  ],
  primaryObjectHealth: [
    { key: "activeTenants", label: "Active Tenants", format: "number", icon: "Building2" },
    { key: "trialsEnding", label: "Trials Ending Soon", format: "number", icon: "Hourglass" },
  ],
  liveOps: [
    { key: "mrr", label: "MRR", format: "currency", icon: "DollarSign", emptyText: "—" },
    { key: "apiCallsToday", label: "API Calls Today", format: "number", icon: "Activity", emptyText: "—" },
    { key: "incidentsOpen", label: "Open Incidents", format: "number", icon: "AlertTriangle", emptyText: "None" },
  ],
  alertThresholds: [
    {
      key: "churnRate",
      label: "Churn Risk",
      operator: "gte",
      value: 5,
      severity: "warning",
      message: "Churn at {value}% — investigate top churn drivers",
    },
  ],
  suggestedActionRules: [
    {
      id: "review_subscriptions",
      title: "Review subscriptions",
      reason: "Identify failed renewals and upgrades",
      conditionKey: "hasSubscriptions",
      severity: "info",
      href: "/dashboard/subscriptions",
      icon: "CreditCard",
    },
    {
      id: "manage_feature_flags",
      title: "Audit feature flags",
      reason: "Avoid unintended rollouts",
      conditionKey: "hasFeatureFlags",
      severity: "warning",
      href: "/dashboard/feature-flags",
      icon: "ToggleRight",
    },
    {
      id: "rotate_api_keys",
      title: "Rotate API keys",
      reason: "Maintain security hygiene",
      conditionKey: "hasApiKeys",
      severity: "info",
      href: "/dashboard/api-keys",
      icon: "Key",
    },
  ],
  failureModes: ["Churn spikes", "Usage outages", "Revenue leakage"],
};

const LEGAL_DASHBOARD: IndustryDashboardDefinition = {
  industry: "legal",
  title: "Legal Practice Dashboard",
  subtitle: "Stay on top of cases, deadlines, and billing",
  primaryObjectLabel: "Case",
  defaultTimeHorizon: "week",
  sections: [
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
    "primary_object_health",
  ],
  primaryObjectHealth: [
    { key: "activeCases", label: "Active Cases", format: "number", icon: "Briefcase" },
    { key: "overdueTasks", label: "Overdue Tasks", format: "number", icon: "AlertTriangle" },
  ],
  liveOps: [
    { key: "billableHoursWeek", label: "Billable Hours (WTD)", format: "number", icon: "Clock", emptyText: "—" },
    { key: "invoicesOutstanding", label: "Outstanding Invoices", format: "currency", icon: "Receipt", emptyText: "—" },
  ],
  alertThresholds: [
    {
      key: "overdueTasks",
      label: "Overdue Tasks",
      operator: "gte",
      value: 1,
      severity: "critical",
      message: "{count} overdue tasks — review deadlines",
    },
  ],
  suggestedActionRules: [
    {
      id: "review_cases",
      title: "Review active cases",
      reason: "Prevent deadline slips",
      conditionKey: "hasActiveCases",
      severity: "info",
      href: "/dashboard/legal-services",
      icon: "Scale",
    },
    {
      id: "send_invoices",
      title: "Send invoices",
      reason: "Improve cash flow",
      conditionKey: "hasOutstandingInvoices",
      severity: "warning",
      href: "/dashboard/invoices",
      icon: "Send",
    },
  ],
  failureModes: ["Missed deadlines", "Unbilled work", "Cash flow gaps"],
};

const HEALTHCARE_DASHBOARD: IndustryDashboardDefinition = {
  industry: "healthcare",
  title: "Clinic Operations",
  subtitle: "Keep schedules full and patients cared for",
  primaryObjectLabel: "Appointment",
  defaultTimeHorizon: "today",
  sections: [
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
    "primary_object_health",
  ],
  primaryObjectHealth: [
    { key: "appointmentsToday", label: "Appointments Today", format: "number", icon: "Calendar" },
    { key: "noShowRisk", label: "No-Show Risk", format: "percent", icon: "UserX" },
  ],
  liveOps: [
    { key: "waitingRoom", label: "Waiting Room", format: "number", icon: "Users", emptyText: "Empty" },
    { key: "avgWaitTime", label: "Avg Wait Time", format: "duration", icon: "Clock", emptyText: "—" },
  ],
  alertThresholds: [
    {
      key: "avgWaitTimeMinutes",
      label: "Wait Time Spike",
      operator: "gte",
      value: 30,
      severity: "warning",
      message: "Average wait time is {value}min",
    },
  ],
  suggestedActionRules: [
    {
      id: "review_schedule",
      title: "Review today's schedule",
      reason: "Reduce wait times and gaps",
      conditionKey: "hasSchedule",
      severity: "info",
      href: "/dashboard/appointments",
      icon: "CalendarCheck",
    },
    {
      id: "bill_patients",
      title: "Review billing",
      reason: "Ensure claims/invoices are up to date",
      conditionKey: "hasBilling",
      severity: "info",
      href: "/dashboard/billing",
      icon: "Receipt",
    },
  ],
  failureModes: ["Long waits", "No-shows", "Billing backlog"],
};

const FITNESS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "fitness",
  title: "Gym Performance",
  subtitle: "Grow memberships and keep classes full",
  primaryObjectLabel: "Membership",
  defaultTimeHorizon: "week",
  sections: [
    "decision_kpis",
    "live_operations",
    "bottlenecks_alerts",
    "suggested_actions",
    "primary_object_health",
  ],
  primaryObjectHealth: [
    { key: "activeMembers", label: "Active Members", format: "number", icon: "Users" },
    { key: "classesToday", label: "Classes Today", format: "number", icon: "Dumbbell" },
  ],
  liveOps: [
    { key: "checkinsToday", label: "Check-ins Today", format: "number", icon: "UserCheck", emptyText: "—" },
    { key: "classFillRate", label: "Class Fill Rate", format: "number", icon: "Percent", emptyText: "—" },
  ],
  alertThresholds: [
    {
      key: "classFillRate",
      label: "Low Class Fill",
      operator: "lte",
      value: 40,
      severity: "info",
      message: "Class fill rate at {value}% — consider promotions",
    },
  ],
  suggestedActionRules: [
    {
      id: "manage_memberships",
      title: "Manage memberships",
      reason: "Track renewals and churn",
      conditionKey: "hasMemberships",
      severity: "info",
      href: "/dashboard/memberships",
      icon: "CreditCard",
    },
    {
      id: "review_schedule",
      title: "Review class schedule",
      reason: "Optimize attendance",
      conditionKey: "hasClasses",
      severity: "info",
      href: "/dashboard/classes",
      icon: "Calendar",
    },
  ],
  failureModes: ["Member churn", "Empty classes", "Low retention"],
};

const WELLNESS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "wellness",
  title: "Wellness Operations",
  subtitle: "Deliver great sessions and retain clients",
  primaryObjectLabel: "Session",
  defaultTimeHorizon: "week",
  sections: [
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
    "primary_object_health",
  ],
  primaryObjectHealth: [
    { key: "activePrograms", label: "Active Programs", format: "number", icon: "Sparkles" },
    { key: "clientsActive", label: "Active Clients", format: "number", icon: "Users" },
  ],
  liveOps: [
    { key: "sessionsToday", label: "Sessions Today", format: "number", icon: "Calendar", emptyText: "—" },
    { key: "cancellations", label: "Cancellations", format: "number", icon: "XCircle", emptyText: "None" },
  ],
  alertThresholds: [
    {
      key: "cancellations",
      label: "Cancellations",
      operator: "gte",
      value: 5,
      severity: "warning",
      message: "{count} cancellations — check reminder flow",
    },
  ],
  suggestedActionRules: [
    {
      id: "review_bookings",
      title: "Review bookings",
      reason: "Reduce idle time",
      conditionKey: "hasBookings",
      severity: "info",
      href: "/dashboard/bookings",
      icon: "CalendarCheck",
    },
  ],
  failureModes: ["Idle calendar", "High cancellations", "Low retention"],
};

const PETCARE_DASHBOARD: IndustryDashboardDefinition = {
  ...SERVICES_DASHBOARD,
  industry: "petcare",
  title: "Pet Care Operations",
  subtitle: "Appointments, follow-ups, and client retention",
  primaryObjectLabel: "Appointment",
};

const SALON_DASHBOARD: IndustryDashboardDefinition = {
  ...SERVICES_DASHBOARD,
  industry: "salon",
  title: "Salon Bookings",
  subtitle: "Fill chairs and reduce no-shows",
  primaryObjectLabel: "Appointment",
};

const SPA_DASHBOARD: IndustryDashboardDefinition = {
  ...SERVICES_DASHBOARD,
  industry: "spa",
  title: "Spa Appointments",
  subtitle: "Maximize utilization and guest satisfaction",
  primaryObjectLabel: "Appointment",
};

const HOTEL_DASHBOARD: IndustryDashboardDefinition = {
  ...TRAVEL_DASHBOARD,
  industry: "hotel",
  title: "Hotel Operations",
  subtitle: "Maximize occupancy and streamline check-ins",
  primaryObjectLabel: "Room",
};

const RESTAURANT_DASHBOARD: IndustryDashboardDefinition = {
  ...FOOD_DASHBOARD,
  industry: "restaurant",
  title: "Restaurant Operations",
  subtitle: "Keep prep time low and tables turning",
  primaryObjectLabel: "Order",
};

const CATERING_DASHBOARD: IndustryDashboardDefinition = {
  ...FOOD_DASHBOARD,
  industry: "catering",
  title: "Catering Operations",
  subtitle: "Deliver events on time and on budget",
  primaryObjectLabel: "Order",
};

const WHOLESALE_DASHBOARD: IndustryDashboardDefinition = {
  ...B2B_DASHBOARD,
  industry: "wholesale",
  title: "Wholesale Operations",
  subtitle: "Convert bulk orders and keep accounts happy",
  primaryObjectLabel: "Order",
};

const JOBS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "jobs",
  title: "Hiring Pipeline",
  subtitle: "Publish roles and move candidates through stages",
  primaryObjectLabel: "Job",
  defaultTimeHorizon: "week",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],
  primaryObjectHealth: [
    { key: "activeJobs", label: "Active Jobs", format: "number", icon: "Briefcase" },
    { key: "applicationsOpen", label: "Open Applications", format: "number", icon: "Users" },
  ],
  liveOps: [
    { key: "newApplicationsToday", label: "New Applications", format: "number", icon: "UserPlus", emptyText: "—" },
    { key: "interviewsScheduled", label: "Interviews Scheduled", format: "number", icon: "Calendar", emptyText: "—" },
  ],
  alertThresholds: [
    {
      key: "staleJobsCount",
      label: "Stale Postings",
      operator: "gte",
      value: 5,
      severity: "info",
      message: "{count} postings have low application flow — refresh listings",
    },
  ],
  suggestedActionRules: [
    {
      id: "post_job",
      title: "Post a new role",
      reason: "Keep the pipeline active",
      conditionKey: "hasNoJobs",
      severity: "info",
      href: "/dashboard/jobs/new",
      icon: "Plus",
    },
    {
      id: "review_applications",
      title: "Review applications",
      reason: "Fast responses improve conversion",
      conditionKey: "hasApplications",
      severity: "warning",
      href: "/dashboard/applications",
      icon: "Inbox",
    },
  ],
  failureModes: ["Slow hiring", "Candidate drop-off", "Unfilled roles"],
};

const SPECIALIZED_DASHBOARD: IndustryDashboardDefinition = {
  ...RETAIL_DASHBOARD,
  industry: "specialized",
  title: "Specialized Operations",
  subtitle: "A flexible dashboard for niche workflows",
  primaryObjectLabel: "Product",
};

// ---------------------------------------------------------------------------
// Registry — maps industry slugs to their native dashboard definition.
// Industries without a specific definition fall back to the closest match.
// ---------------------------------------------------------------------------

const DEFINITIONS: Record<string, IndustryDashboardDefinition> = {
  analytics: ANALYTICS_DASHBOARD,
  retail: RETAIL_DASHBOARD,
  fashion: {
    ...RETAIL_DASHBOARD,
    industry: "fashion",
    title: "Fashion Operations",
  },
  electronics: {
    ...RETAIL_DASHBOARD,
    industry: "electronics",
    title: "Electronics Operations",
  },
  beauty: {
    ...RETAIL_DASHBOARD,
    industry: "beauty",
    title: "Beauty Operations",
  },
  grocery: {
    ...RETAIL_DASHBOARD,
    industry: "grocery",
    title: "Grocery Operations",
  },
  one_product: {
    ...RETAIL_DASHBOARD,
    industry: "one_product",
    title: "Product Performance",
    subtitle: "Maximize conversion and ad efficiency",
    primaryObjectLabel: "Product",
  },
  food: FOOD_DASHBOARD,
  restaurant: RESTAURANT_DASHBOARD,
  catering: CATERING_DASHBOARD,
  "meal-kit": MEAL_KIT_DASHBOARD,
  services: SERVICES_DASHBOARD,
  salon: SALON_DASHBOARD,
  spa: SPA_DASHBOARD,
  wellness: WELLNESS_DASHBOARD,
  petcare: PETCARE_DASHBOARD,
  fitness: FITNESS_DASHBOARD,
  healthcare: HEALTHCARE_DASHBOARD,
  b2b: B2B_DASHBOARD,
  wholesale: WHOLESALE_DASHBOARD,
  events: EVENTS_DASHBOARD,
  nightlife: NIGHTLIFE_DASHBOARD,
  automotive: AUTOMOTIVE_DASHBOARD,
  travel_hospitality: TRAVEL_DASHBOARD,
  hotel: HOTEL_DASHBOARD,
  real_estate: {
    ...SERVICES_DASHBOARD,
    industry: "real_estate",
    title: "Property Management",
    subtitle: "Fill viewings and close deals faster",
    primaryObjectLabel: "Listing",
  },
  digital: DIGITAL_DASHBOARD,
  nonprofit: NONPROFIT_DASHBOARD,
  education: EDUCATION_DASHBOARD,
  blog_media: BLOG_MEDIA_DASHBOARD,
  creative_portfolio: CREATIVE_PORTFOLIO_DASHBOARD,
  marketplace: MARKETPLACE_DASHBOARD,
  saas: SAAS_DASHBOARD,
  legal: LEGAL_DASHBOARD,
  jobs: JOBS_DASHBOARD,
  specialized: SPECIALIZED_DASHBOARD,
};

export function getIndustryDashboardDefinition(
  industrySlug: IndustrySlug,
): IndustryDashboardDefinition | null {
  return DEFINITIONS[industrySlug] ?? null;
}

export function hasIndustryNativeDashboard(
  industrySlug: IndustrySlug,
): boolean {
  return industrySlug in DEFINITIONS;
}
