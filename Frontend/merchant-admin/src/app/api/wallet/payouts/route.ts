import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (_req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const payouts = await prisma.payout?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ payouts }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("[WALLET_PAYOUTS_GET] Failed to load payouts", { storeId, error });
    return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
  }
});
