import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (req, { storeId }) => {
    try {
      // Fetch theme history for this store
      const history = await prisma.merchantThemeHistory.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const formatted = history.map((h) => ({
        id: h.id,
        version: "1.0",
        publishedAt: h.createdAt,
        author: h.changedByUserId || "System",
        status: "archived",
        description: h.reason || "",
        template: null,
        publishedBy: h.changedByUserId,
      }));

      return NextResponse.json(formatted, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[STOREFRONT_HISTORY_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
