import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { requireAuthFromRequest } from "@/lib/session.server";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/dashboard/sidebar-counts - Get pending/unread counts for sidebar nav items
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user?.storeId) {
      return NextResponse.json({ data: {} }, { status: 401 });
    }

    const storeId = user.storeId;

    const [unreadNotifications, openTickets, activeOrders, refundRequests] =
      await Promise.all([
        prisma.notification.count({ where: { storeId, isRead: false } }),
        prisma.supportTicket.count({
          where: { storeId, status: { in: ["open", "in_progress", "waiting"] } },
        }),
        prisma.order.count({
          where: {
            storeId,
            status: {
              in: [
                "PENDING_PAYMENT",
                "PAID",
                "PROCESSING",
                "FULFILLING",
                "OUT_FOR_DELIVERY",
                "SHIPPED",
                "REFUND_REQUESTED",
                "DISPUTED",
              ],
            },
          },
        }),
        prisma.refund.count({
          where: { storeId, status: { in: ["REQUESTED", "APPROVED", "PROCESSING"] } },
        }),
      ]);

    // Each key is a normalized sidebar path (e.g. "/dashboard/orders"),
    // each value is the pending / unread count to display as a badge.
    const counts: Record<string, number> = {
      "/dashboard/notifications": unreadNotifications,
      "/dashboard/support": openTickets,
      "/dashboard/orders": activeOrders,
      "/dashboard/finance/refunds": refundRequests,
    };

    return NextResponse.json({ data: counts });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/dashboard/sidebar-counts",
      operation: "GET",
    });
    return NextResponse.json({ data: {} });
  }
}
