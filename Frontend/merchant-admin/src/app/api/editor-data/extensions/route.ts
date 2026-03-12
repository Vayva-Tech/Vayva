import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function getBaseExtensionIds(industrySlug: string): string[] {
  const map: Record<string, string[]> = {
    retail: ["vayva.retail"],
    fashion: ["vayva.retail"],
    electronics: ["vayva.retail"],
    beauty: ["vayva.retail"],
    grocery: ["vayva.retail"],
    one_product: ["vayva.retail"],
    marketplace: ["vayva.retail"],
    food: ["vayva.kitchen"],
    real_estate: ["vayva.real-estate"],
    services: ["vayva.bookings"],
    education: ["vayva.education"],
    events: ["vayva.events"],
    nightlife: ["vayva.events"],
    b2b: ["vayva.b2b"],
    nonprofit: ["vayva.nonprofit"],
    automotive: ["vayva.automotive"],
    travel_hospitality: ["vayva.travel"],
    creative_portfolio: ["vayva.creative"],
  };

  return map[industrySlug] || [];
}

/**
 * GET /api/editor-data/extensions
 * Returns enabled extension IDs for the current store.
 * Used by the WebStudio plugin to filter available commerce blocks.
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const store = await prisma.store?.findUnique({
        where: { id: storeId },
        select: { industrySlug: true },
      });

      const baseExtensionIds = getBaseExtensionIds(store?.industrySlug || "");

      const addOns =
        (await prisma.storeAddOn?.findMany({
          where: {
            storeId,
            status: "ACTIVE" as any,
          },
          select: { extensionId: true },
        })) || [];

      // Use extensionId from StoreAddOn
      const addOnExtensionIds = addOns
        .map((a) => a.extensionId)
        .filter((v): v is string => typeof v === "string" && v.length > 0);

      const enabledExtensionIds = Array.from(
        new Set([...baseExtensionIds, ...addOnExtensionIds]),
      );

      return NextResponse.json(
        { data: enabledExtensionIds },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_EXTENSIONS_GET] Failed to fetch enabled extensions", {
        storeId,
        error,
      });
      return NextResponse.json(
        { error: "Failed to fetch enabled extensions" },
        { status: 500 },
      );
    }
  },
);
