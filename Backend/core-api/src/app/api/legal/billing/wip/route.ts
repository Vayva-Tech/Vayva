import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/billing/wip
 * Get work in progress (unbilled time/expenses)
 */
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      
      const entries = await prisma.timeEntry.findMany({
        where: {
          case: { storeId },
          status: { in: ['submitted', 'approved'] },
        },
        include: {
          case: {
            select: {
              caseNumber: true,
              clientNames: true,
            },
          },
        },
      });

      const wip = {
        total: entries.reduce((sum, t) => sum + t.amount, 0),
        hours: entries.reduce((sum, t) => sum + t.duration, 0),
        entries,
      };

      return NextResponse.json({ success: true, data: wip });
    } catch (error) {
      logger.error('[LEGAL_BILLING_WIP_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load WIP' },
        { status: 500 }
      );
    }
  }
);
