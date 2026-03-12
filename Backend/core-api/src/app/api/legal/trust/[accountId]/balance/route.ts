import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ accountId: string }>;
}

/**
 * GET /api/legal/trust/[accountId]/balance
 * Get trust account current balance
 */
export const GET = withVayvaAPI(
  PERMISSIONS.TRUST_VIEW,
  async (request: NextRequest, { params }: RouteParams) => {
    try {
      const { accountId } = await params;
      
      const account = await prisma.trustAccount.findUnique({
        where: { id: accountId },
        select: {
          id: true,
          name: true,
          currentBalance: true,
          ledgerBalance: true,
          reconciliationStatus: true,
          lastReconciliation: true,
        },
      });

      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Trust account not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: account });
    } catch (error) {
      logger.error('[LEGAL_TRUST_BALANCE_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load trust balance' },
        { status: 500 }
      );
    }
  }
);
