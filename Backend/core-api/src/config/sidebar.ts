import { logger } from "@vayva/shared";
import { normalizeSidebarHref } from "@/lib/utils";
import { extensionRegistry } from "@/lib/extensions/registry";
import { INDUSTRY_CONFIG } from "./industry";
import type { DashboardPlanTier } from "./dashboard-variants";
import type { IndustrySlug } from "@/lib/templates/types";

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
  catalog: { name: "Products", href: "/dashboard/products", icon: "Package" },
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
  ops_console: {
    name: "Ops Console",
    href: "/dashboard/ops-console",
    icon: "Terminal",
  },
  control_center: {
    name: "Control Center",
    href: "/dashboard/control-center",
    icon: "LayoutTemplate",
  },
  settings: {
    name: "Settings",
    href: "/dashboard/settings/profile",
    icon: "Settings",
  },
};

// ---------------------------------------------------------------------------
// Group indices — used for extension placement
// ---------------------------------------------------------------------------
const _GROUP_HOME = 0;
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
]);
const GROWTH_MODULES = new Set([
  "marketing",
  "content",
  "customers",
  "support",
]);
const MONEY_MODULES = new Set(["finance"]);

// ---------------------------------------------------------------------------
// Fallback sidebar (no industry config available)
// ---------------------------------------------------------------------------
export const SIDEBAR_GROUPS = [
  {
    name: "Home",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { name: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
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
      { name: "Content", href: "/dashboard/posts", icon: "FileText" },
      { name: "Customers", href: "/dashboard/customers", icon: "Users" },
      { name: "Socials", href: "/dashboard/socials", icon: "MessageCircle" },
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
// Tier-based module filtering
// ---------------------------------------------------------------------------
function filterModulesByTier(
  modules: string[],
  tier?: DashboardPlanTier,
): string[] {
  if (tier === "basic") {
    return modules.filter((mod) => mod !== "finance" && mod !== "marketing");
  }
  return modules;
}

// ---------------------------------------------------------------------------
// Industry-aware sidebar builder
// ---------------------------------------------------------------------------
export function getSidebar(
  industrySlug: IndustrySlug,
  enabledIds: string[],
  tier?: DashboardPlanTier,
) {
  const config = INDUSTRY_CONFIG[industrySlug as keyof typeof INDUSTRY_CONFIG];
  if (!config) return SIDEBAR_GROUPS;

  const filteredModules = filterModulesByTier(config.modules, tier);

  // Build industry-specific items into their groups
  const commerceItems: { name: string; href: string; icon: string }[] = [];
  const growthItems: { name: string; href: string; icon: string }[] = [];
  const moneyItems: { name: string; href: string; icon: string }[] = [];

  const seenRoutes = new Set<string>();

  filteredModules.forEach((mod: string) => {
    if (mod === "dashboard" || mod === "settings") return;

    const defaultItem = MODULE_TO_SIDEBAR[mod];
    if (!defaultItem) return;

    const label = config.moduleLabels?.[mod] || defaultItem.name;
    const route =
      normalizeSidebarHref(
        config.moduleRoutes?.[mod]?.index || defaultItem.href,
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

  // Inject extension sidebar items into the correct group
  activeExtensions.forEach((ext) => {
    ext.sidebarItems?.forEach((item) => {
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
        } catch (e: unknown) {
          const _errMsg = e instanceof Error ? e.message : String(e);
          logger.warn("[SIDEBAR_CONFIG_ERROR]", { error: _errMsg });
        }
      }
    }
  }

  return finalGroups;
}
