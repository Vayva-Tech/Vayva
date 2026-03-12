import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/legal/cases/[id]/closing
 * Initiate case closing workflow
 */
export const POST = withVayvaAPI(
  PERMISSIONS.CASE_MANAGE,
  async (request: NextRequest, { params }: RouteParams) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { reason } = body;

      const closedCase = await prisma.case.update({
        where: { id },
        data: {
          status: 'closed',
          closedDate: new Date(),
          closedReason: reason,
        },
      });

      return NextResponse.json({ success: true, data: closedCase });
    } catch (error) {
      logger.error('[LEGAL_CASE_CLOSING_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to close case' },
        { status: 500 }
      );
    }
  }
);
