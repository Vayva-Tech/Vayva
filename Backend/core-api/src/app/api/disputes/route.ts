import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function getErrorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, correlationId }) => {
    try {
      const disputes = await prisma.dispute.findMany({
        where: { storeId },
        include: {
          order: { select: { orderNumber: true, customerEmail: true } },
        },
        orderBy: { evidenceDueAt: "asc" },
      });
      const formatted = disputes.map((d) => ({
        id: d.id,
        amount: Number(d.amount),
        currency: d.currency,
        status: d.status,
        reason: d.reasonCode || "General Dispute",
        dueAt: d.evidenceDueAt,
        orderNumber: d.order?.orderNumber || "N/A",
        customerEmail: d.order?.customerEmail || "N/A",
        createdAt: d.createdAt,
      }));
      return NextResponse.json(
        { success: true, data: formatted, requestId: correlationId },
        {
          headers: standardHeaders(correlationId),
        },
      );
    } catch (error: unknown) {
      logger.error("Disputes API Error", {
        error: getErrorMessage(error),
        stack: getErrorStack(error),
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        { error: "Failed to fetch disputes", requestId: correlationId },
        { status: 500, headers: standardHeaders(correlationId) },
      );
    }
  },
);
