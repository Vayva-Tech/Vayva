import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma, OrderStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const filter = searchParams.get("filter") || "all";

      // Get all event products
      const events = await prisma.product.findMany({
        where: { storeId, productType: "event" },
        select: { id: true, title: true, metadata: true },
      });

      const eventIds = events.map((e) => e.id);
      const eventMap = new Map(events.map((e) => [e.id, e]));

      if (eventIds.length === 0) {
        return NextResponse.json([]);
      }

      // Build order status filter
      let statusFilter: Prisma.OrderWhereInput = {};
      switch (filter) {
        case "paid":
          statusFilter = {
            status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] },
          };
          break;
        case "used":
          statusFilter = { metadata: { path: ["checkedIn"], equals: true } };
          break;
        case "refunded":
          statusFilter = { status: OrderStatus.REFUNDED };
          break;
      }

      // Get order items for events
      const orderItems = await prisma.orderItem.findMany({
        where: {
          productId: { in: eventIds },
          order: {
            storeId,
            ...statusFilter,
          },
        },
        include: {
          order: {
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          productVariant: true,
        },
        orderBy: { order: { createdAt: "desc" } },
      });

      const tickets = orderItems.map((item) => {
        const event = eventMap.get(item.productId || "");
        const eventMetadata = isRecord(event?.metadata) ? event.metadata : {};
        const orderMetadata = isRecord(item.order.metadata)
          ? item.order.metadata
          : {};

        // Determine ticket status
        let status = "PAID";
        if (item.order.status === OrderStatus.REFUNDED) status = "REFUNDED";
        else if (item.order.status === OrderStatus.PENDING_PAYMENT)
          status = "PENDING";
        else if (orderMetadata.checkedIn) status = "USED";

        return {
          id: item.id,
          orderNumber: item.order.orderNumber,
          customerName: item.order.customer
            ? `${item.order.customer.firstName || ""} ${item.order.customer.lastName || ""}`.trim()
            : "Guest",
          customerEmail:
            item.order.customer?.email || item.order.customerEmail || "",
          customerPhone:
            item.order.customer?.phone || item.order.customerPhone || "",
          eventName: event?.title || "Unknown Event",
          eventDate: eventMetadata.eventDate || "",
          ticketType: item.productVariant?.title || "General",
          quantity: item.quantity,
          unitPrice: Number(item.price),
          totalAmount: Number(item.price) * item.quantity,
          status,
          purchasedAt: item.order.createdAt.toISOString(),
          qrCode: `${item.order.orderNumber}-${item.id}`,
        };
      });

      return NextResponse.json(tickets, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_TICKETS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
