import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const url = new URL(req.url);
      const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

      // Fetch settlement batches for this store
      const settlements = await prisma.settlementBatch.findMany({
        where: { storeId },
        orderBy: { periodEnd: "desc" },
        take: limit,
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
          totalAmount: true,
          totalFees: true,
          totalRefunds: true,
          netAmount: true,
          totalOrders: true,
          status: true,
          transactionIds: true,
          payoutId: true,
          processedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const formattedSettlements = settlements.map((s) => ({
        id: s.id,
        periodStart: s.periodStart.toISOString(),
        periodEnd: s.periodEnd.toISOString(),
        totalAmount: s.totalAmount,
        totalFees: s.totalFees,
        totalRefunds: s.totalRefunds,
        netAmount: s.netAmount,
        totalOrders: s.totalOrders,
        transactionCount: s.transactionIds?.length || 0,
        status: s.status,
        payoutId: s.payoutId,
        processedAt: s.processedAt?.toISOString(),
        paidAt: s.processedAt?.toISOString(), // Alias for frontend compatibility
        createdAt: s.createdAt.toISOString(),
      }));

      return NextResponse.json(
        { settlements: formattedSettlements },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SETTLEMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load settlements" },
        { status: 500 },
      );
    }
  },
);
