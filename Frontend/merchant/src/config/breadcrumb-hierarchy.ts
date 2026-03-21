/**
 * Breadcrumb hierarchy configuration.
 *
 * Maps parent dashboard paths to their child/sibling pages so the breadcrumb
 * component can render dropdown navigation for intermediate segments.
 */

export interface BreadcrumbChild {
  label: string;
  href: string;
}

export interface BreadcrumbParent {
  label: string;
  children: BreadcrumbChild[];
}

/**
 * Parent paths mapped to their navigable children.
 * When a breadcrumb segment matches one of these paths, a dropdown chevron is
 * rendered and clicking it reveals the sibling links.
 */
export const BREADCRUMB_HIERARCHY: Record<string, BreadcrumbParent> = {
  "/dashboard/marketing": {
    label: "Marketing",
    children: [
      { label: "Overview", href: "/dashboard/marketing" },
      { label: "Discounts", href: "/dashboard/marketing/discounts" },
      { label: "Flash Sales", href: "/dashboard/marketing/flash-sales" },
      { label: "Bundles", href: "/dashboard/marketing/bundles" },
      { label: "Affiliates", href: "/dashboard/marketing/affiliates" },
      { label: "Automation", href: "/dashboard/marketing/automation" },
      { label: "Campaigns", href: "/dashboard/marketing/campaigns" },
      { label: "Pro", href: "/dashboard/marketing/pro" },
    ],
  },

  "/dashboard/settings": {
    label: "Settings",
    children: [
      { label: "Overview", href: "/dashboard/settings" },
      { label: "Profile", href: "/dashboard/settings/profile" },
      { label: "Store", href: "/dashboard/settings/store" },
      { label: "Team", href: "/dashboard/settings/team" },
      { label: "Roles", href: "/dashboard/settings/roles" },
      { label: "Billing", href: "/dashboard/settings/billing" },
      { label: "Payments", href: "/dashboard/settings/payments" },
      { label: "Shipping", href: "/dashboard/settings/shipping" },
      { label: "Notifications", href: "/dashboard/settings/notifications" },
      { label: "Security", href: "/dashboard/settings/security" },
      { label: "Integrations", href: "/dashboard/settings/integrations" },
      { label: "AI Agent", href: "/dashboard/settings/ai-agent" },
      { label: "Industry", href: "/dashboard/settings/industry" },
      { label: "Store Policies", href: "/dashboard/settings/store-policies" },
      { label: "Navigation", href: "/dashboard/settings/navigation" },
      { label: "Audit Log", href: "/dashboard/settings/audit-log" },
      { label: "SSO", href: "/dashboard/settings/sso" },
    ],
  },

  "/dashboard/finance": {
    label: "Finance",
    children: [
      { label: "Overview", href: "/dashboard/finance" },
      { label: "Transactions", href: "/dashboard/finance/transactions" },
      { label: "Payouts", href: "/dashboard/finance/payouts" },
      { label: "Statements", href: "/dashboard/finance/statements" },
      { label: "BNPL", href: "/dashboard/finance/bnpl" },
      { label: "Refunds", href: "/dashboard/finance/refunds" },
      { label: "Wallet", href: "/dashboard/finance/wallet" },
    ],
  },

  "/dashboard/fulfillment": {
    label: "Fulfillment",
    children: [
      { label: "Shipments", href: "/dashboard/fulfillment/shipments" },
      { label: "Pickups", href: "/dashboard/fulfillment/pickups" },
      { label: "Issues", href: "/dashboard/fulfillment/issues" },
    ],
  },

  "/dashboard/support": {
    label: "Support",
    children: [
      { label: "Overview", href: "/dashboard/support" },
      { label: "Messages", href: "/dashboard/support/messages" },
      { label: "Disputes", href: "/dashboard/support/disputes" },
      { label: "New Ticket", href: "/dashboard/support/new" },
    ],
  },

  "/dashboard/nightlife": {
    label: "Nightlife",
    children: [
      { label: "Overview", href: "/dashboard/nightlife" },
      { label: "Reservations", href: "/dashboard/nightlife/reservations" },
      { label: "Events", href: "/dashboard/nightlife/events" },
      { label: "Tickets", href: "/dashboard/nightlife/tickets" },
    ],
  },

  "/dashboard/nonprofit": {
    label: "Nonprofit",
    children: [
      { label: "Overview", href: "/dashboard/nonprofit" },
      { label: "Campaigns", href: "/dashboard/nonprofit/campaigns" },
      { label: "Donations", href: "/dashboard/nonprofit/donations" },
      { label: "Grants", href: "/dashboard/nonprofit/grants" },
      { label: "Volunteers", href: "/dashboard/nonprofit/volunteers" },
    ],
  },

  "/dashboard/inventory": {
    label: "Inventory",
    children: [
      { label: "Overview", href: "/dashboard/inventory" },
      { label: "Locations", href: "/dashboard/inventory/locations" },
    ],
  },

  "/dashboard/catalog": {
    label: "Catalog",
    children: [
      { label: "Overview", href: "/dashboard/catalog" },
      { label: "Collections", href: "/dashboard/catalog/collections" },
    ],
  },

  "/dashboard/control-center": {
    label: "Control Center",
    children: [
      { label: "Templates", href: "/dashboard/control-center" },
      { label: "Customize", href: "/dashboard/control-center/customize" },
    ],
  },

  "/dashboard/ai": {
    label: "AI",
    children: [
      { label: "Overview", href: "/dashboard/ai" },
      { label: "AI Hub", href: "/dashboard/ai-hub" },
      { label: "AI Insights", href: "/dashboard/ai-insights" },
      { label: "AI Agent Profile", href: "/dashboard/ai-agent/profile" },
      { label: "AI Agent Channels", href: "/dashboard/ai-agent/channels" },
      { label: "Autopilot", href: "/dashboard/autopilot" },
      { label: "WhatsApp Agent", href: "/dashboard/wa-agent" },
    ],
  },

  "/dashboard/analytics": {
    label: "Analytics",
    children: [
      { label: "Overview", href: "/dashboard/analytics" },
      { label: "Advanced", href: "/dashboard/analytics/advanced" },
      { label: "Reports", href: "/dashboard/reports" },
      { label: "Performance", href: "/dashboard/performance" },
    ],
  },

  "/dashboard/b2b": {
    label: "B2B",
    children: [
      { label: "Overview", href: "/dashboard/b2b" },
      { label: "Quotes", href: "/dashboard/b2b/quotes" },
      { label: "Credit Accounts", href: "/dashboard/b2b/credit-accounts" },
      { label: "Requisitions", href: "/dashboard/b2b/requisitions" },
    ],
  },

  "/dashboard/customers": {
    label: "Customers",
    children: [
      { label: "All Customers", href: "/dashboard/customers" },
      { label: "Insights", href: "/dashboard/customers/insights" },
      { label: "Reviews", href: "/dashboard/reviews" },
    ],
  },

  "/dashboard/blog": {
    label: "Blog",
    children: [
      { label: "All Posts", href: "/dashboard/blog" },
      { label: "New Post", href: "/dashboard/blog/new" },
    ],
  },

  "/dashboard/products": {
    label: "Products",
    children: [
      { label: "All Products", href: "/dashboard/products" },
      { label: "New Product", href: "/dashboard/products/new" },
      { label: "Catalog", href: "/dashboard/catalog" },
      { label: "Collections", href: "/dashboard/catalog/collections" },
      { label: "Inventory", href: "/dashboard/inventory" },
    ],
  },

  "/dashboard/orders": {
    label: "Orders",
    children: [
      { label: "All Orders", href: "/dashboard/orders" },
      { label: "Refunds", href: "/dashboard/refunds" },
    ],
  },

  "/dashboard/rescue": {
    label: "Rescue",
    children: [
      { label: "Overview", href: "/dashboard/rescue" },
      { label: "Incidents", href: "/dashboard/rescue/incidents" },
    ],
  },

  "/dashboard/marketing/campaigns": {
    label: "Campaigns",
    children: [
      { label: "All Campaigns", href: "/dashboard/marketing/campaigns" },
      { label: "New Campaign", href: "/dashboard/marketing/campaigns/new" },
    ],
  },
};
