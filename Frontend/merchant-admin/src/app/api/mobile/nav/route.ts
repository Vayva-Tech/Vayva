import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import { logger } from "@vayva/shared";

type MobileNavKey =
  | "dashboard"
  | "notifications"
  | "more"
  | "orders"
  | "products"
  | "customers"
  | "finance"
  | "inbox";

type MobileNavItem = {
  key: MobileNavKey;
  title: string;
  href: string;
  icon: string;
};

type MobileNavConfig = {
  tabs: MobileNavKey[];
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDefaultTabsForIndustry(industrySlug: IndustrySlug): MobileNavKey[] {
  const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;
  const mods: string[] = Array.isArray(config?.modules) ? config.modules : [];

  const pinned: MobileNavKey[] = ["dashboard", "notifications", "more"];

  const candidates: MobileNavKey[] = [];
  if (mods.includes("sales")) candidates.push("orders");
  if (mods.includes("catalog")) candidates.push("products");

  // Always core, but we keep tabs to 5 max.
  candidates.push("customers");
  candidates.push("finance");

  // Services-like industries typically care about inbox/messaging.
  if (mods.includes("bookings") || mods.includes("content")) {
    candidates.unshift("inbox");
  } else {
    candidates.push("inbox");
  }

  const unique = [...new Set(candidates)].filter(
    (k) => !pinned.includes(k) && k !== "more",
  );

  return [...pinned.slice(0, 2), ...unique.slice(0, 2), "more"] as MobileNavKey[];
}

function getNavItem(key: MobileNavKey): MobileNavItem {
  switch (key) {
    case "dashboard":
      return { key, title: "Home", href: "/(tabs)", icon: "Home" };
    case "orders":
      return { key, title: "Orders", href: "/(tabs)/orders", icon: "ShoppingBag" };
    case "products":
      return { key, title: "Products", href: "/(tabs)/products", icon: "Package" };
    case "customers":
      return { key, title: "Customers", href: "/(tabs)/customers", icon: "Users" };
    case "finance":
      return { key, title: "Finance", href: "/(tabs)/finance", icon: "Wallet" };
    case "inbox":
      return { key, title: "Inbox", href: "/(tabs)/inbox", icon: "MessageCircle" };
    case "notifications":
      return { key, title: "Alerts", href: "/(tabs)/notifications", icon: "Bell" };
    case "more":
      return { key, title: "More", href: "/(tabs)/menu", icon: "Menu" };
  }
}

function normalizeTabs(keys: unknown): MobileNavKey[] {
  const allowed: MobileNavKey[] = [
    "dashboard",
    "notifications",
    "more",
    "orders",
    "products",
    "customers",
    "finance",
    "inbox",
  ];

  if (!Array.isArray(keys)) return [];

  const out: MobileNavKey[] = [];
  for (const k of keys) {
    if (typeof k === "string" && (allowed as string[]).includes(k)) {
      out.push(k as MobileNavKey);
    }
  }

  return out;
}

function enforceTabRules(tabs: MobileNavKey[]): MobileNavKey[] {
  const pinned: MobileNavKey[] = ["dashboard", "notifications", "more"];
  const normalized = [...new Set(tabs)];

  for (const p of pinned) {
    if (!normalized.includes(p)) normalized.unshift(p);
  }

  const filtered = normalized.filter((t) => t !== "more");
  const finalTabs = filtered.slice(0, 4);

  if (!finalTabs.includes("dashboard")) finalTabs.unshift("dashboard");
  if (!finalTabs.includes("notifications")) finalTabs.splice(1, 0, "notifications");

  const truncated = [...new Set(finalTabs)].slice(0, 4);
  return [...truncated, "more"];
}

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, industrySlug: true, settings: true },
      });

      if (!store) {
        return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
      }

      const industrySlug = (store.industrySlug as IndustrySlug) || "retail";
      const settings = (store.settings as Record<string, unknown>) || {};

      const rawMobileNav = settings.mobileNavConfigByUser;
      const mobileNavByUser = isRecord(rawMobileNav) ? rawMobileNav : {};
      const rawUserConfig = mobileNavByUser[user.id];

      const defaultTabs = getDefaultTabsForIndustry(industrySlug);

      let resolvedTabs = defaultTabs;
      if (isRecord(rawUserConfig) && rawUserConfig.tabs) {
        const userTabs = normalizeTabs(rawUserConfig.tabs);
        if (userTabs.length > 0) {
          resolvedTabs = enforceTabRules(userTabs);
        }
      }

      const tabItems = resolvedTabs.map(getNavItem);

      return NextResponse.json({
        success: true,
        data: {
          industrySlug,
          tabs: tabItems,
        },
      });
    } catch (error: unknown) {
      logger.error("[MOBILE_NAV_GET]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json({ success: false, error: "Failed to load nav" }, { status: 500 });
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const tabs = isRecord(body) ? normalizeTabs(body.tabs) : [];

      if (tabs.length === 0) {
        return NextResponse.json({ success: false, error: "tabs is required" }, { status: 400 });
      }

      const enforced = enforceTabRules(tabs);

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, settings: true },
      });
      if (!store) {
        return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
      }

      const settings = (store.settings as Record<string, unknown>) || {};
      const rawMobileNav = settings.mobileNavConfigByUser;
      const mobileNavByUser = isRecord(rawMobileNav) ? { ...rawMobileNav } : {};

      const nextConfig: MobileNavConfig = {
        tabs: enforced,
        updatedAt: new Date().toISOString(),
      };

      mobileNavByUser[user.id] = nextConfig;

      await prisma.store.update({
        where: { id: storeId },
        data: {
          settings: {
            ...(settings as Record<string, unknown>),
            mobileNavConfigByUser: mobileNavByUser,
          } as unknown as import("@vayva/db").Prisma.InputJsonValue,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          tabs: enforced.map(getNavItem),
        },
      });
    } catch (error: unknown) {
      logger.error("[MOBILE_NAV_POST]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json({ success: false, error: "Failed to save nav" }, { status: 500 });
    }
  },
);
