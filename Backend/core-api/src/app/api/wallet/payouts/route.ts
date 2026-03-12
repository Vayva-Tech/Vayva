import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (_req, { storeId }) => {
    try {
      const payouts = await prisma.payout.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json(
        { payouts },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[WALLET_PAYOUTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load payouts" },
        { status: 500 },
      );
    }
  },
);
