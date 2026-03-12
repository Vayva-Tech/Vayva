import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { ReferralService } from "@/services/referral.service";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const settings = isRecord(store?.settings) ? store.settings : {};
      let code =
        typeof settings.referralCode === "string"
          ? settings.referralCode
          : undefined;
      if (!code) {
        code = await ReferralService.generateCode(storeId);
      }
      const stats = await prisma.referralAttribution.findMany({
        where: { metadata: { path: ["referrerStoreId"], equals: storeId } },
      });
      const rewards = await prisma.ledgerEntry.findMany({
        where: {
          storeId,
          referenceType: "REFERRAL_REWARD",
        },
        orderBy: { createdAt: "desc" },
      });
      const pendingDiscount = await ReferralService.getMonthlyDiscount(storeId);
      return NextResponse.json(
        {
          code,
          stats: {
            total: stats.length,
            conversions: stats.filter((s) => !!s.firstPaymentAt).length,
          },
          pendingDiscount,
          rewards: rewards.map((r) => ({
            id: r.id,
            amount: r.amount,
            createdAt: r.createdAt,
            description: r.description,
          })),
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (e: unknown) {
      logger.error("[REFERRALS_GET]", e, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch referral data" },
        { status: 500 },
      );
    }
  },
);
