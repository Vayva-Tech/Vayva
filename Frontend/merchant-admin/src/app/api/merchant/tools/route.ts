import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";

// GET /api/merchant/tools - Get available tools and enabled status for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      // Get store with industry and settings
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          id: true,
          industrySlug: true,
          settings: true,
        },
      });

      if (!store) {
        return NextResponse.json(
          { success: false, error: "Store not found" },
          { status: 404 }
        );
      }

      const industrySlug = (store.industrySlug as IndustrySlug) || "retail";
      const industryConfig = INDUSTRY_CONFIG[industrySlug];

      if (!industryConfig) {
        return NextResponse.json(
          { success: false, error: "Invalid industry configuration" },
          { status: 500 }
        );
      }

      // Get enabled tools from store settings
      const settings = (store.settings as Record<string, unknown>) || {};
      const enabledTools = (settings.enabledTools as string[]) || [];
      const toolPreferences = (settings.toolPreferences as Record<string, unknown>) || {};

      // Build tool list from industry modules
      const tools = industryConfig.modules.map((moduleKey: string) => {
        const moduleConfig = industryConfig.moduleRoutes?.[moduleKey];
        const isEnabled = enabledTools.includes(moduleKey);
        const isRequired = ["catalog", "sales"].includes(moduleKey); // Core modules can't be disabled

        return {
          id: moduleKey,
          name: formatModuleName(moduleKey),
          description: getModuleDescription(moduleKey),
          icon: getModuleIcon(moduleKey),
          category: getModuleCategory(moduleKey),
          isEnabled: isRequired ? true : isEnabled,
          isRequired,
          canToggle: !isRequired,
          routes: moduleConfig?.index
            ? [moduleConfig.index, moduleConfig.create].filter(Boolean)
            : getDefaultRoutesForModule(moduleKey),
          preferences: toolPreferences[moduleKey] || {},
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          tools,
          industry: industrySlug,
          total: tools.length,
          enabled: tools.filter((t: { isEnabled: boolean }) => t.isEnabled).length,
        },
      });
    } catch (error: unknown) {
      logger.error("[TOOLS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch tools" },
        { status: 500 }
      );
    }
  }
);

// POST /api/merchant/tools - Enable/disable tools
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { toolId, enabled, preferences } = body;

      if (!toolId || typeof enabled !== "boolean") {
        return NextResponse.json(
          { success: false, error: "toolId and enabled are required" },
          { status: 400 }
        );
      }

      // Prevent disabling core modules
      if (!enabled && ["catalog", "sales"].includes(toolId)) {
        return NextResponse.json(
          { success: false, error: "Cannot disable core modules" },
          { status: 400 }
        );
      }

      // Get current settings
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const settings = (store?.settings as Record<string, unknown>) || {};
      const enabledTools = new Set((settings.enabledTools as string[]) || []);

      // Update enabled tools
      if (enabled) {
        enabledTools.add(toolId);
      } else {
        enabledTools.delete(toolId);
      }

      // Update tool preferences if provided
      const toolPreferences = (settings.toolPreferences as Record<string, unknown>) || {};
      if (preferences) {
        toolPreferences[toolId] = {
          ...(toolPreferences[toolId] || {}),
          ...preferences,
          updatedAt: new Date().toISOString(),
        };
      }

      // Save updated settings
      const updatedSettings: Record<string, unknown> = {
        ...settings,
        enabledTools: Array.from(enabledTools),
        toolPreferences,
      };

      await prisma.store.update({
        where: { id: storeId },
        data: {
          settings: updatedSettings as unknown as import("@vayva/db").Prisma.InputJsonValue,
        },
      });

      logger.info("[TOOLS_UPDATED]", {
        storeId,
        toolId,
        enabled,
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        data: {
          toolId,
          enabled,
          preferences: toolPreferences[toolId],
        },
      });
    } catch (error: unknown) {
      logger.error("[TOOLS_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update tool" },
        { status: 500 }
      );
    }
  }
);

// Helper functions
function formatModuleName(moduleKey: string): string {
  return moduleKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getModuleDescription(moduleKey: string): string {
  const descriptions: Record<string, string> = {
    catalog: "Manage products, inventory, and pricing",
    sales: "Process orders, track sales, and manage revenue",
    bookings: "Handle appointments, reservations, and scheduling",
    fulfillment: "Manage shipping, delivery, and logistics",
    finance: "Track finances, payouts, and accounting",
    marketing: "Run campaigns, promotions, and customer engagement",
    content: "Manage blog posts, courses, and educational content",
    customers: "Manage customer relationships and profiles",
    subscriptions: "Handle recurring billing and subscription plans",
    api_keys: "Manage API access and developer integrations",
  };
  return descriptions[moduleKey] || `Manage ${formatModuleName(moduleKey).toLowerCase()}`;
}

function getModuleIcon(moduleKey: string): string {
  const icons: Record<string, string> = {
    catalog: "Package",
    sales: "ShoppingCart",
    bookings: "Calendar",
    fulfillment: "Truck",
    finance: "Wallet",
    marketing: "Megaphone",
    content: "BookOpen",
    customers: "Users",
    subscriptions: "Repeat",
    api_keys: "Key",
  };
  return icons[moduleKey] || "GridFour";
}

function getModuleCategory(moduleKey: string): string {
  const categories: Record<string, string> = {
    catalog: "commerce",
    sales: "commerce",
    bookings: "operations",
    fulfillment: "operations",
    finance: "finance",
    marketing: "growth",
    content: "content",
    customers: "crm",
    subscriptions: "commerce",
    api_keys: "developer",
  };
  return categories[moduleKey] || "general";
}

function getDefaultRoutesForModule(moduleKey: string): string[] {
  const routes: Record<string, string[]> = {
    catalog: ["/dashboard/products"],
    sales: ["/dashboard/orders"],
    bookings: ["/dashboard/bookings"],
    fulfillment: ["/dashboard/fulfillment", "/dashboard/logistics"],
    finance: ["/dashboard/finance"],
    marketing: ["/dashboard/marketing"],
    content: ["/dashboard/posts", "/dashboard/blog"],
    customers: ["/dashboard/customers"],
    subscriptions: ["/dashboard/subscriptions"],
    api_keys: ["/dashboard/api-keys"],
  };
  return routes[moduleKey] || [`/dashboard/${moduleKey.replace(/_/g, "-")}`];
}
