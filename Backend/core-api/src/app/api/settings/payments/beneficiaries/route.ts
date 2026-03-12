import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { prisma } from "@vayva/db";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(
  [PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MANAGE],
  async (req, { storeId }) => {
    try {
      const beneficiary =
        (await prisma.bankBeneficiary.findFirst({
          where: { storeId, isDefault: true },
        })) ||
        (await prisma.bankBeneficiary.findFirst({
          where: { storeId }, // Fallback to any
        }));
      if (!beneficiary) {
        return NextResponse.json(null);
      }
      return NextResponse.json(
        {
          bankName: beneficiary.bankName,
          accountNumber: beneficiary.accountNumber,
          accountName: beneficiary.accountName,
          isVerified: true, // Assuming verified if it exists in this table for now
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[BENEFICIARY_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
