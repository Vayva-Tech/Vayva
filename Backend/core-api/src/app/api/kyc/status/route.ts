import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.KYC_MANAGE,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          kycRecord: true,
        },
      });
      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }
      const kycRecord = store.kycRecord;

      const status = kycRecord?.status || "NOT_STARTED";

      return NextResponse.json(
        {
          status,
          ninSubmitted: Boolean(kycRecord?.fullNinEncrypted),
          cacSubmitted: Boolean(kycRecord?.cacNumberEncrypted),
          canWithdraw: status === "VERIFIED",
          submittedAt: kycRecord?.updatedAt || kycRecord?.createdAt || null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[KYC_STATUS_GET]", error);
      return NextResponse.json(
        { error: "Failed to fetch KYC status" },
        { status: 500 },
      );
    }
  },
);
