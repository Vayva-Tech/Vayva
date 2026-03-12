import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/legal/cases/[id]/stage
 * Update case stage/milestone
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.CASE_MANAGE,
  async (request: NextRequest, { params }: RouteParams) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { stage } = body;

      const updatedCase = await prisma.case.update({
        where: { id },
        data: { stage },
      });

      return NextResponse.json({ success: true, data: updatedCase });
    } catch (error) {
      logger.error('[LEGAL_CASE_STAGE_UPDATE_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update case stage' },
        { status: 500 }
      );
    }
  }
);
