import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/trust/accounts
 * List all trust accounts (IOLTA and non-IOLTA)
 */
export const GET = withVayvaAPI(
  PERMISSIONS.TRUST_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      
      const accounts = await prisma.trustAccount.findMany({
        where: { storeId, isActive: true },
        include: {
          clientLedgers: {
            where: { balance: { gt: 0 } },
          },
        },
      });

      return NextResponse.json({ success: true, data: accounts });
    } catch (error) {
      logger.error('[LEGAL_TRUST_ACCOUNTS_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load trust accounts' },
        { status: 500 }
      );
    }
  }
);
