import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/calendar/court-appearances
 * Get scheduled court appearances
 */
export const GET = withVayvaAPI(
  PERMISSIONS.CALENDAR_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const where: any = {
        case: { storeId },
        dateTime: { gte: new Date() },
      };

      if (startDate && endDate) {
        where.dateTime = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const appearances = await prisma.courtAppearance.findMany({
        where,
        include: {
          case: {
            select: {
              caseNumber: true,
              title: true,
              clientNames: true,
            },
          },
        },
        orderBy: { dateTime: 'asc' },
      });

      return NextResponse.json({ success: true, data: appearances });
    } catch (error) {
      logger.error('[LEGAL_CALENDAR_APPEARANCES_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load court appearances' },
        { status: 500 }
      );
    }
  }
);
