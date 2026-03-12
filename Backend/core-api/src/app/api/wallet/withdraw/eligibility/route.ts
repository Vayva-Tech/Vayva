import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { wallet: true },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const kycStatus = store.kycStatus || "NOT_STARTED";
      const isEligible = kycStatus === "VERIFIED";
      const blocks = [];

      if (!isEligible) {
        blocks.push("KYC Verification Required");
      }

      if (!store.wallet || store.wallet.availableKobo <= BigInt(0)) {
        blocks.push("Insufficient balance");
      }

      return NextResponse.json(
        {
          kycStatus: kycStatus.toLowerCase(),
          availableBalance:
            Number(store.wallet?.availableKobo || BigInt(0)) / 100,
          minWithdrawal: 1000,
          blockedReasons: blocks,
          isEligible: isEligible && blocks.length === 0,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[WITHDRAW_ELIGIBILITY_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
