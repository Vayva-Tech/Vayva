import { logger } from "@vayva/shared";
import { normalizeSidebarHref } from "@/lib/utils";
import { IndustryConfig } from "@/types/industry";
import {
  INDUSTRY_ARCHETYPES,
  INDUSTRY_SLUG_MAP,
  getIndustryConfig,
} from "./industry-archetypes";
import type { DashboardPlanTier } from "./dashboard-variants";

// ---------------------------------------------------------------------------
// Module → Sidebar item defaults
// ---------------------------------------------------------------------------
const MODULE_TO_SIDEBAR: Record<
  string,
  { name: string; href: string; icon: string }
> = {
  dashboard: { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  analytics: {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
  },
  catalog: { name: "Products", href: "/dashboard/catalog", icon: "Package" },
  sales: { name: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
  bookings: { name: "Bookings", href: "/dashboard/bookings", icon: "Calendar" },
  fulfillment: {
    name: "Fulfillment",
    href: "/dashboard/fulfillment/shipments",
    icon: "Truck",
  },
  finance: { name: "Finance", href: "/dashboard/finance", icon: "CreditCard" },
  marketing: {
    name: "Marketing",
    href: "/dashboard/marketing/discounts",
    icon: "Megaphone",
  },
  content: { name: "Content", href: "/dashboard/posts", icon: "FileText" },
  customers: { name: "Customers", href: "/dashboard/customers", icon: "Users" },
  support: { name: "Support", href: "/dashboard/support", icon: "LifeBuoy" },
  portfolio: {
    name: "Portfolio",
    href: "/dashboard/portfolio",
    icon: "Folder",
  },
  resources: {
    name: "Resources",
    href: "/dashboard/resources",
    icon: "Package",
  },
  calendar: {
    name: "Calendar",
    href: "/dashboard/calendar",
    icon: "Calendar",
  },
  control_center: {
    name: "Control Center",
    href: "/dashboard/control-center",
    icon: "LayoutTemplate",
  },
  ai: {
    name: "AI Tools",
    href: "/dashboard/ai",
    icon: "Sparkle",
  },
  designer: {
    name: "Designer",
    href: "/dashboard/designer",
    icon: "PaintBrush",
  },
  vehicles: {
    name: "Fleet",
    href: "/dashboard/vehicles",
    icon: "Car",
  },
  properties: {
    name: "Properties",
    href: "/dashboard/properties",
    icon: "House",
  },
  campaigns: {
    name: "Campaigns",
    href: "/dashboard/marketing/campaigns",
    icon: "Target",
  },
  settings: {
    name: "Settings",
    href: "/dashboard/settings/profile",
    icon: "Settings",
  },
  // Sales & Operations modules
  leads: {
    name: "Leads",
    href: "/dashboard/leads",
    icon: "User",
  },
  quotes: {
    name: "Quotes",
    href: "/dashboard/quotes",
    icon: "FileText",
  },
  rescue: {
    name: "Rescue",
    href: "/dashboard/rescue",
    icon: "Warning",
  },
  appeals: {
    name: "Appeals",
    href: "/dashboard/appeals",
    icon: "Clipboard",
  },
  enrollments: {
    name: "Enrollments",
    href: "/dashboard/enrollments",
    icon: "Users",
  },
  refunds: {
    name: "Refunds",
    href: "/dashboard/finance/refunds",
    icon: "ArrowBendUpLeft",
  },
  b2b: {
    name: "B2B Wholesale",
    href: "/dashboard/b2b",
    icon: "Handshake",
  },
  nonprofit: {
    name: "Nonprofit",
    href: "/dashboard/nonprofit",
    icon: "Heart",
  },
  events: {
    name: "Events",
    href: "/dashboard/events",
    icon: "Ticket",
  },
  // Education modules
  education: {
    name: "Courses",
    href: "/dashboard/courses",
    icon: "BookOpen",
  },
  fitness: {
    name: "Memberships",
    href: "/dashboard/memberships",
    icon: "Dumbbell",
  },
  healthcare: {
    name: "Services",
    href: "/dashboard/services",
    icon: "Stethoscope",
  },
  legal: {
    name: "Cases",
    href: "/dashboard/cases",
    icon: "Briefcase",
  },
  jobs: {
    name: "Listings",
    href: "/dashboard/listings",
    icon: "Briefcase",
  },
};

// ---------------------------------------------------------------------------
// Group indices — used for extension placement
// ---------------------------------------------------------------------------
const GROUP_HOME = 0;
const GROUP_COMMERCE = 1;
const GROUP_GROWTH = 2;
const GROUP_MONEY = 3;
const GROUP_PLATFORM = 4;

// Which modules belong to which sidebar group
const COMMERCE_MODULES = new Set([
  "catalog",
  "sales",
  "bookings",
  "fulfillment",
  "b2b",
  "events",
  "education",
  "fitness",
  "healthcare",
  "legal",
  "jobs",
  "properties",
  "vehicles",
  "enrollments",
]);
const GROWTH_MODULES = new Set([
  "marketing",
  "customers",
  "support",
  "portfolio",
  "resources",
  "leads",
  "quotes",
  "rescue",
  "appeals",
  "campaigns",
  "nonprofit",
]);
const MONEY_MODULES = new Set(["finance", "refunds"]);

// ---------------------------------------------------------------------------
// Fallback sidebar (no industry config available)
// ---------------------------------------------------------------------------
export const SIDEBAR_GROUPS = [
  {
    name: "Home",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { name: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
      { name: "AI Intelligence", href: "/intelligence", icon: "Globe" },
    ],
  },
  {
    name: "Commerce",
    items: [
      { name: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
      { name: "Products", href: "/dashboard/products", icon: "Package" },
      {
        name: "Fulfillment",
        href: "/dashboard/fulfillment/shipments",
        icon: "Truck",
      },
    ],
  },
  {
    name: "Growth",
    items: [
      {
        name: "Marketing",
        href: "/dashboard/marketing/discounts",
        icon: "Megaphone",
      },
      { name: "Customers", href: "/dashboard/customers", icon: "Users" },
      { name: "Socials", href: "/dashboard/socials", icon: "MessageCircle" },
      { name: "Portfolio", href: "/dashboard/portfolio", icon: "Folder" },
      { name: "Calendar", href: "/dashboard/calendar", icon: "Calendar" },
    ],
  },
  {
    name: "Money",
    items: [
      { name: "Finance", href: "/dashboard/finance", icon: "CreditCard" },
    ],
  },
  {
    name: "Platform",
    items: [
      {
        name: "Control Center",
        href: "/dashboard/control-center",
        icon: "LayoutTemplate",
      },
      { name: "Autopilot", href: "/dashboard/autopilot", icon: "Sparkles" },
      { name: "Extensions", href: "/dashboard/extensions", icon: "Blocks" },
      {
        name: "Settings",
        href: "/dashboard/settings/profile",
        icon: "Settings",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Tier-based module filtering - DEPRECATED
// Feature gating should happen on pages, not sidebar
// ---------------------------------------------------------------------------
function filterModulesByTier(
  modules: readonly string[] | string[] | undefined,
  _tier?: DashboardPlanTier,
): string[] {
  if (!modules) return [];
  return [...modules];
}

// Extension registry - minimal implementation for sidebar extensions
const extensionRegistry = {
  getActiveForStore: (_industrySlug: string, _enabledIds: string[]) => [] as Array<{
    sidebarItems?: Array<{
      parentGroup?: string;
      href: string;
      label: string;
      icon: string;
    }>;
  }>,
};

// ---------------------------------------------------------------------------
// Industry-aware sidebar builder
// ---------------------------------------------------------------------------
export function getSidebar(
  industrySlug: string,
  enabledIds: string[],
  tier?: DashboardPlanTier,
  enabledTools?: string[],
) {
  // Use the new archetype-based config with backward-compatible slug mapping
  const config = getIndustryConfig(industrySlug);

  const enabledModules = (config.modules || []).filter((mod: string) => {
    // Core modules are always enabled
    if (mod === "catalog" || mod === "sales") return true;
    // Check if module is in enabled tools list (if no enabledTools, allow all)
    if (!enabledTools || enabledTools.length === 0) return true;
    return enabledTools.includes(mod);
  });

  // Build industry-specific items into their groups
  const commerceItems: { name: string; href: string; icon: string }[] = [];
  const growthItems: { name: string; href: string; icon: string }[] = [];
  const moneyItems: { name: string; href: string; icon: string }[] = [];

  const seenRoutes = new Set<string>();

  enabledModules.forEach((mod: string) => {
    if (mod === "dashboard" || mod === "settings") return;

    const defaultItem = MODULE_TO_SIDEBAR[mod];
    if (!defaultItem) return;

    const label = config.moduleLabels?.[mod] || defaultItem.name;
    const route =
      normalizeSidebarHref(
        (typeof config.moduleRoutes?.[mod] === "object" ? config.moduleRoutes[mod].index : undefined) || defaultItem.href,
      ) || normalizeSidebarHref(defaultItem.href);

    if (seenRoutes.has(route)) return;
    seenRoutes.add(route);

    const icon = config.moduleIcons?.[mod] || defaultItem.icon;
    const item = { name: label, href: route, icon };

    if (COMMERCE_MODULES.has(mod)) {
      commerceItems.push(item);
    } else if (GROWTH_MODULES.has(mod)) {
      growthItems.push(item);
    } else if (MONEY_MODULES.has(mod)) {
      moneyItems.push(item);
    } else {
      growthItems.push(item);
    }
  });

  // Load extensions
  const activeExtensions = extensionRegistry.getActiveForStore(
    industrySlug,
    enabledIds,
  );

  // Build final groups
  const groups = [
    {
      name: "Home",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { name: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
        { name: "AI Intelligence", href: "/intelligence", icon: "Globe" },
      ],
    },
    { name: "Commerce", items: commerceItems },
    {
      name: "Growth",
      items: [
        ...growthItems,
        { name: "Socials", href: "/dashboard/socials", icon: "MessageCircle" },
      ],
    },
    { name: "Money", items: moneyItems },
    {
      name: "Platform",
      items: [
        {
          name: "Control Center",
          href: "/dashboard/control-center",
          icon: "LayoutTemplate",
        },
        {
          name: "Autopilot",
          href: "/dashboard/autopilot",
          icon: "Sparkles",
        },
        {
          name: "Settings",
          href: "/dashboard/settings/profile",
          icon: "Settings",
        },
      ],
    },
  ];

  // Inject extension sidebar items into the correct group
  activeExtensions.forEach((ext: { sidebarItems?: Array<{ parentGroup?: string; href: string; label: string; icon: string }> }) => {
    ext.sidebarItems?.forEach((item: { parentGroup?: string; href: string; label: string; icon: string }) => {
      let groupIdx = GROUP_COMMERCE;
      if (item.parentGroup === "ops") groupIdx = GROUP_GROWTH;
      if (item.parentGroup === "growth") groupIdx = GROUP_GROWTH;
      if (item.parentGroup === "money") groupIdx = GROUP_MONEY;
      if (item.parentGroup === "system") groupIdx = GROUP_PLATFORM;

      const href = normalizeSidebarHref(item.href);
      if (!href) return;

      const exists = groups.some((g) =>
        g.items.some((i) => normalizeSidebarHref(i.href) === href),
      );
      if (exists) return;

      groups[groupIdx].items.push({
        name: item.label,
        href,
        icon: item.icon,
      });
    });
  });

  // Ensure Settings stays at the bottom of Platform group
  const platformGroup = groups[GROUP_PLATFORM];
  const settingsIdx = platformGroup.items.findIndex(
    (i) => i.name === "Settings",
  );
  if (settingsIdx !== -1 && settingsIdx !== platformGroup.items.length - 1) {
    const [settingsItem] = platformGroup.items.splice(settingsIdx, 1);
    platformGroup.items.push(settingsItem);
  }

  // Remove empty groups
  const finalGroups = groups.filter((g) => g.items.length > 0);

  // Dev-mode duplicate route validator
  if (process.env.NODE_ENV === "development") {
    const allRoutes = new Map<string, string[]>();
    for (const group of finalGroups) {
      for (const item of group.items) {
        const href = normalizeSidebarHref(item.href);
        if (!href) continue;
        const owners = allRoutes.get(href) || [];
        owners.push(`${group.name} → ${item.name}`);
        allRoutes.set(href, owners);
      }
    }
    for (const [href, owners] of allRoutes) {
      if (owners.length > 1) {
        try {
          logger.warn("[SIDEBAR_CONFIG_ERROR]", {
            error: `[Sidebar] Duplicate route "${href}" found in: ${owners.join(", ")}. Industry: ${industrySlug}, Tier: ${tier || "default"}`,
          });
        } catch (e: any) {
          const _errMsg = e instanceof Error ? e.message : String(e);
          logger.warn("[SIDEBAR_CONFIG_ERROR]", { error: _errMsg });
        }
      }
    }
  }

  return finalGroups;
}
