import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/legal/trust/[clientId]/ledger
 * Get client trust ledger with transactions
 */
export const GET = withVayvaAPI(
  PERMISSIONS.TRUST_VIEW,
  async (request: NextRequest, { params }: RouteParams) => {
    try {
      const { clientId } = await params;
      
      const ledgers = await prisma.clientLedger.findMany({
        where: { clientId },
        include: {
          transactions: {
            orderBy: { transactionDate: 'desc' },
            take: 100,
          },
          account: true,
        },
      });

      return NextResponse.json({ success: true, data: ledgers });
    } catch (error) {
      logger.error('[LEGAL_TRUST_LEDGER_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load client ledger' },
        { status: 500 }
      );
    }
  }
);
