import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";

function formatModuleName(key: string): string {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function getModuleDescription(key: string): string {
  return `Manage your ${formatModuleName(key).toLowerCase()}`;
}
function getModuleIcon(key: string): string {
  return key;
}
function getModuleCategory(key: string): string {
  return "general";
}
function getDefaultRoutesForModule(key: string): string[] {
  return [`/dashboard/${key}`];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/tools", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
