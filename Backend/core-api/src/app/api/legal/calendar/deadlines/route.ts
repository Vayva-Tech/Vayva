import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/calendar/deadlines
 * Get case-related deadlines
 */
export const GET = withVayvaAPI(
  PERMISSIONS.CALENDAR_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const where: any = { case: { storeId } };

      if (status) {
        where.status = status;
      }

      const deadlines = await prisma.deadline.findMany({
        where,
        include: {
          case: {
            select: {
              caseNumber: true,
              title: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      return NextResponse.json({ success: true, data: deadlines });
    } catch (error) {
      logger.error('[LEGAL_CALENDAR_DEADLINES_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load deadlines' },
        { status: 500 }
      );
    }
  }
);
