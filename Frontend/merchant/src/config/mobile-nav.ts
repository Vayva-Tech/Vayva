import type { IconName } from "@vayva/ui";

export type MobileNavTab =
  | "home"
  | "orders"
  | "products"
  | "bookings"
  | "catalog"
  | "finance"
  | "marketing"
  | "content"
  | "analytics"
  | "settings";

export interface MobileNavConfig {
  // Array of 4 tab IDs in display order
  tabs: [MobileNavTab, MobileNavTab, MobileNavTab, MobileNavTab];
  // Set of module IDs hidden from the "More" sheet
  hidden: string[];
  // Config version for future migrations
  version: number;
}

// Default config aligned with commerce archetype
export const DEFAULT_MOBILE_NAV_CONFIG: MobileNavConfig = {
  tabs: ["home", "orders", "products", "finance"],
  hidden: [],
  version: 2,
};

export interface MobileNavTabDefinition {
  id: MobileNavTab;
  name: string;
  href: string;
  icon: IconName;
}

export const MOBILE_NAV_TAB_DEFINITIONS: Record<MobileNavTab, MobileNavTabDefinition> =
  {
    home: {
      id: "home",
      name: "Home",
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
    orders: {
      id: "orders",
      name: "Orders",
      href: "/dashboard/orders",
      icon: "ShoppingBag",
    },
    products: {
      id: "products",
      name: "Products",
      href: "/dashboard/products",
      icon: "Package",
    },
    bookings: {
      id: "bookings",
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: "Calendar",
    },
    catalog: {
      id: "catalog",
      name: "Catalog",
      href: "/dashboard/catalog",
      icon: "Grid3X3",
    },
    finance: {
      id: "finance",
      name: "Finance",
      href: "/dashboard/finance",
      icon: "Wallet",
    },
    marketing: {
      id: "marketing",
      name: "Marketing",
      href: "/dashboard/marketing",
      icon: "Target",
    },
    content: {
      id: "content",
      name: "Content",
      href: "/dashboard/content",
      icon: "FileText",
    },
    analytics: {
      id: "analytics",
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: "BarChart3",
    },
    settings: {
      id: "settings",
      name: "Settings",
      href: "/dashboard/settings/profile",
      icon: "Settings",
    },
  };

export const MOBILE_NAV_AVAILABLE_TABS: MobileNavTab[] = [
  "home",
  "orders",
  "products",
  "bookings",
  "catalog",
  "finance",
  "marketing",
  "content",
  "analytics",
  "settings",
];

export function normalizeMobileNavConfig(
  config: MobileNavConfig,
): MobileNavConfig {
  const candidate = Array.isArray(config.tabs) ? config.tabs : [];

  const uniqueTabs: MobileNavTab[] = [];
  for (const rawTab of candidate) {
    if (!MOBILE_NAV_AVAILABLE_TABS.includes(rawTab)) continue;
    if (!uniqueTabs.includes(rawTab)) uniqueTabs.push(rawTab);
  }

  if (!uniqueTabs.includes("home")) {
    uniqueTabs.unshift("home");
  }

  for (const tab of DEFAULT_MOBILE_NAV_CONFIG.tabs) {
    if (uniqueTabs.length >= 4) break;
    if (!uniqueTabs.includes(tab)) uniqueTabs.push(tab);
  }

  for (const tab of MOBILE_NAV_AVAILABLE_TABS) {
    if (uniqueTabs.length >= 4) break;
    if (!uniqueTabs.includes(tab)) uniqueTabs.push(tab);
  }

  const tabs = uniqueTabs.slice(0, 4) as MobileNavConfig["tabs"];
  const hidden = Array.isArray(config.hidden)
    ? config.hidden.filter((value): value is string => typeof value === "string")
    : [];

  return {
    tabs,
    hidden,
    version: typeof config.version === "number" ? config.version : 2,
  };
}

// ============================================================================
// INDUSTRY-SPECIFIC MOBILE NAV CONFIGS
// ============================================================================

export const MOBILE_NAV_BY_INDUSTRY: Record<
  "commerce" | "food" | "bookings" | "content" | "marketplace",
  MobileNavConfig
> = {
  commerce: {
    tabs: ["home", "orders", "products", "finance"],
    hidden: ["bookings", "content"],
    version: 2,
  },
  food: {
    tabs: ["home", "orders", "catalog", "finance"],
    hidden: ["products", "bookings", "content"],
    version: 2,
  },
  bookings: {
    tabs: ["home", "bookings", "catalog", "finance"],
    hidden: ["orders", "products", "content"],
    version: 2,
  },
  content: {
    tabs: ["home", "catalog", "content", "analytics"],
    hidden: ["orders", "products", "bookings"],
    version: 2,
  },
  marketplace: {
    tabs: ["home", "finance", "analytics", "settings"],
    hidden: ["orders", "products", "bookings", "catalog"],
    version: 2,
  },
};

/**
 * Get mobile nav config for an industry archetype
 */
export function getMobileNavConfig(
  archetype: "commerce" | "food" | "bookings" | "content" | "marketplace",
): MobileNavConfig {
  return MOBILE_NAV_BY_INDUSTRY[archetype] || DEFAULT_MOBILE_NAV_CONFIG;
}
