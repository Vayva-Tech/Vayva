import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/cases/conflicts-checks
 * Get pending conflicts checks
 */
export const GET = withVayvaAPI(
  PERMISSIONS.CASE_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      
      const conflicts = await prisma.conflictCheck.findMany({
        where: { storeId, status: 'pending' },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: conflicts });
    } catch (error) {
      logger.error('[LEGAL_CONFLICTS_CHECKS_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load conflicts checks' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/legal/cases/conflicts-checks
 * Run conflicts check for new matter
 */
export const POST = withVayvaAPI(
  PERMISSIONS.CASE_MANAGE,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const body = await request.json();
      const {
        prospectiveClientName,
        matterDescription,
        partiesChecked,
        checkedBy,
      } = body;

      // Search existing matters for conflicts
      const existingCases = await prisma.case.findMany({
        where: {
          storeId,
          OR: [
            { clientNames: { hasSome: partiesChecked } },
            { opposingParties: { path: ['name'], string_contains: partiesChecked[0] } },
          ],
        },
      });

      const conflictsFound = existingCases.length > 0;

      const conflictCheck = await prisma.conflictCheck.create({
        data: {
          storeId,
          prospectiveClientName,
          matterDescription,
          partiesChecked,
          checkedBy,
          conflictsFound,
          conflictDetails: conflictsFound
            ? `Found ${existingCases.length} potential conflicts in existing matters`
            : null,
          status: conflictsFound ? 'blocked' : 'cleared',
          clearedDate: conflictsFound ? null : new Date(),
        },
      });

      return NextResponse.json({ success: true, data: conflictCheck });
    } catch (error) {
      logger.error('[LEGAL_CONFLICTS_CHECK_CREATE_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to run conflicts check' },
        { status: 500 }
      );
    }
  }
);
