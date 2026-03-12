import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

type CustomerHistoryParams = {
  storeId: string;
  params: Record<string, string> | Promise<Record<string, string>>;
};

export const GET = withVayvaAPI(PERMISSIONS.CUSTOMERS_VIEW, async (req: NextRequest, { params, storeId }: CustomerHistoryParams) => {
  try {
    const { id } = await params;
    const [orders, bookings] = await Promise.all([
      prisma.order?.findMany({
        where: { customerId: id, storeId },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          orderNumber: true
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      prisma.booking?.findMany({
        where: { customerId: id, storeId },
        include: { service: true },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    ]);
    const history = [
      ...orders.map((o: unknown) => {
        const order = o as { id: string; total: { toNumber?: () => number } | number; status: string; createdAt: { toISOString: () => string }; orderNumber: string | number };
        return {
        id: `ord_${order.id}`,
        type: "order",
        status: order.status.toLowerCase(),
        amount: (order.total as { toNumber?: () => number })?.toNumber ? (order.total as { toNumber: () => number }).toNumber() : Number(order.total),
        date: order.createdAt?.toISOString(),
        description: `Order #${order.orderNumber}`,
        metadata: { orderId: order.id }
      };
      }),
      ...bookings.map((b: unknown) => {
        const booking = b as { id: string; status: string; createdAt: { toISOString: () => string }; service?: { title?: string } };
        return {
        id: `bk_${booking.id}`,
        type: "booking",
        status: booking.status.toLowerCase(),
        date: booking.createdAt?.toISOString(),
        description: `Booking for ${booking?.service?.title}`,
        metadata: { bookingId: booking.id }
      };
      })
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(history, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
  catch (error) {
    logger.error("[CUSTOMER_HISTORY_GET] Failed to fetch customer history", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
});
