import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get pending commissions
      const pendingCommissions = await prisma.travelCommission.findMany({
        where: {
          storeId,
          status: "pending",
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactEmail: true,
            },
          },
          booking: {
            select: {
              id: true,
              destination: true,
              totalPrice: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      // Calculate summary
      const totalPendingAmount = pendingCommissions.reduce((sum, comm) => sum + comm.amount, 0);
      const supplierCount = new Set(pendingCommissions.map(c => c.supplierId)).size;

      return NextResponse.json(
        {
          data: pendingCommissions,
          summary: {
            totalCount: pendingCommissions.length,
            totalAmount: totalPendingAmount,
            supplierCount,
            currency: pendingCommissions[0]?.currency || "USD",
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_COMMISSIONS_PENDING_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch pending commissions" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);