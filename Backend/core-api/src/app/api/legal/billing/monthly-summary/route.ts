import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/billing/monthly-summary
 * Get monthly time and billing summary
 */
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const { searchParams } = new URL(request.url);
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          case: { storeId },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { case: true },
      });

      const billed = timeEntries
        .filter((t) => t.status === 'invoiced')
        .reduce((sum, t) => sum + t.amount, 0);

      const wip = timeEntries
        .filter((t) => t.status === 'approved' || t.status === 'submitted')
        .reduce((sum, t) => sum + t.amount, 0);

      const writeOffs = await prisma.writeOff.aggregate({
        where: {
          case: { storeId },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
      });

      const summary = {
        billed,
        wip,
        writeOffs: writeOffs._sum.amount || 0,
        totalHours: timeEntries.reduce((sum, t) => sum + t.duration, 0),
        entryCount: timeEntries.length,
        period: { year, month },
      };

      return NextResponse.json({ success: true, data: summary });
    } catch (error) {
      logger.error('[LEGAL_BILLING_MONTHLY_SUMMARY_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load billing summary' },
        { status: 500 }
      );
    }
  }
);
