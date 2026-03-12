import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (_req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          kycStatus: true,
          isLive: true,
          payoutsEnabled: true,
          plan: true,
        },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      return NextResponse.json(store, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      logger.error("[MERCHANT_STORE_STATUS_GET]", error);
      return NextResponse.json(
        { error: "Failed to load store status" },
        { status: 500 },
      );
    }
  },
);
