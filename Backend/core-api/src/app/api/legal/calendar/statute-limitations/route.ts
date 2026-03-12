import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/calendar/statute-limitations
 * Get statute of limitations alerts
 */
export const GET = withVayvaAPI(
  PERMISSIONS.CALENDAR_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      
      // Get all active cases with statute of limitation deadlines
      const deadlines = await prisma.deadline.findMany({
        where: {
          case: { storeId, status: 'active' },
          type: 'statute_limitations',
          status: 'pending',
          isHard: true,
        },
        include: {
          case: {
            select: {
              caseNumber: true,
              title: true,
              clientNames: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Calculate days remaining
      const now = new Date();
      const alerts = deadlines.map((d) => {
        const daysRemaining = Math.ceil(
          (d.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          caseNumber: d.case.caseNumber,
          caseTitle: d.case.title,
          deadlineDate: d.dueDate,
          daysRemaining,
          isUrgent: daysRemaining <= 30,
        };
      });

      return NextResponse.json({ success: true, data: alerts });
    } catch (error) {
      logger.error('[LEGAL_STATUTE_LIMITATIONS_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load statute of limitations alerts' },
        { status: 500 }
      );
    }
  }
);
