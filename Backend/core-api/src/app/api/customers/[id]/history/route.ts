import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { params, storeId }) => {
    try {
      const { id } = await params;
      const [orders, bookings] = await Promise.all([
        prisma.order.findMany({
          where: { customerId: id, storeId },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            orderNumber: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.booking.findMany({
          where: { customerId: id, storeId },
          include: { service: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);
      const history = [
        ...orders.map((o) => ({
          id: `ord_${o.id}`,
          type: "order",
          status: o.status.toLowerCase(),
          amount: o.total.toNumber(),
          date: o.createdAt.toISOString(),
          description: `Order #${o.orderNumber}`,
          metadata: { orderId: o.id },
        })),
        ...bookings.map((b) => ({
          id: `bk_${b.id}`,
          type: "booking",
          status: b.status.toLowerCase(),
          date: b.createdAt.toISOString(),
          description: `Booking for ${b.service.title}`,
          metadata: { bookingId: b.id },
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return NextResponse.json(history, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      logger.error("[CUSTOMER_HISTORY_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 },
      );
    }
  },
);
