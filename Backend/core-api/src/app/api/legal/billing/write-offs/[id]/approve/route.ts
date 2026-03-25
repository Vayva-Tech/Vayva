import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/legal/billing/write-offs/[id]/approve
 * Approve write-off
 */
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (request: NextRequest, { params }: RouteParams) => {
    try {
      const { id } = await params;
      const _storeId = request.headers.get("x-store-id") || "default";
      const user = request.headers.get("x-user-id");

      const writeOff = await prisma.writeOff.update({
        where: { id },
        data: {
          status: 'approved',
          approvedBy: user || undefined,
          approvedDate: new Date(),
        },
      });

      // Update time entry status if linked
      if (writeOff.timeEntryId) {
        await prisma.timeEntry.update({
          where: { id: writeOff.timeEntryId },
          data: { status: 'written_off' },
        });
      }

      return NextResponse.json({ success: true, data: writeOff });
    } catch (error) {
      logger.error('[LEGAL_WRITE_OFF_APPROVE_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to approve write-off' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/legal/billing/write-offs/[id]/reject
 * Reject write-off with reason
 */
export const POST_REJECT = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (request: NextRequest, { params }: RouteParams) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { reason } = body;

      const writeOff = await prisma.writeOff.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason: reason,
        },
      });

      return NextResponse.json({ success: true, data: writeOff });
    } catch (error) {
      logger.error('[LEGAL_WRITE_OFF_REJECT_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to reject write-off' },
        { status: 500 }
      );
    }
  }
);
