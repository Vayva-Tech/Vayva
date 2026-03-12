import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user, params }) => {
    const { id } = await params;
    try {
      // Get order item and verify it belongs to store
      const orderItem = await prisma.orderItem.findFirst({
        where: { id },
        include: {
          order: true,
        },
      });

      if (!orderItem || orderItem.order.storeId !== storeId) {
        return NextResponse.json(
          { error: "Ticket not found" },
          { status: 404 },
        );
      }

      // Update order metadata to mark as checked in
      const currentMetadata = isRecord(orderItem.order.metadata)
        ? orderItem.order.metadata
        : {};

      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: {
          metadata: {
            ...currentMetadata,
            checkedIn: true,
            checkedInAt: new Date().toISOString(),
            checkedInBy: user.id,
          },
        },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_TICKETS_CHECK_IN_POST]", error, {
        storeId,
        ticketId: id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
