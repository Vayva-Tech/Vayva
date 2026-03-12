import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export const GET = withVayvaAPI(PERMISSIONS.ORDERS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter") || "all";

        // Get all event products
        const events = await prisma.product?.findMany({
            where: { storeId, productType: "event" },
            select: { id: true, title: true, metadata: true },
        });

        const eventIds = events.map((e: any) => e.id);
        const eventMap = new Map(events.map((e: any) => [e.id, e]));

        if (eventIds.length === 0) {
            return NextResponse.json([]);
        }

        // Build order status filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let statusFilter: any = {};
        switch (filter) {
            case "paid":
                statusFilter = { status: { in: ["COMPLETED", "PROCESSING"] } };
                break;
            case "used":
                statusFilter = { metadata: { path: ["checkedIn"], equals: true } };
                break;
            case "refunded":
                statusFilter = { status: "REFUNDED" };
                break;
        }

        // Get order items for events
        const orderItems = await prisma.orderItem?.findMany({
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
                            select: { firstName: true, lastName: true, email: true, phone: true },
                        },
                    },
                },
                productVariant: true,
            },
            orderBy: { order: { createdAt: "desc" } },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tickets = orderItems.map((item: any) => {
            const event = eventMap.get(item.productId || "");
            const eventMetadata = (event?.metadata as Record<string, unknown>) || {};
            const orderMetadata = (item.order?.metadata as Record<string, unknown>) || {};

            // Determine ticket status
            let status = "PAID";
            if ((item.order as any).status === "REFUNDED") status = "REFUNDED";
            else if ((item.order as any).status?.toUpperCase() === "PENDING") status = "PENDING";
            else if (orderMetadata.checkedIn) status = "USED";

            return {
                id: item.id,
                orderNumber: item.order?.orderNumber,
                customerName: item.order?.customer
                    ? `${item?.order?.customer.firstName || ""} ${item?.order?.customer.lastName || ""}`.trim()
                    : "Guest",
                customerEmail: item.order?.customer?.email || item.order?.customerEmail || "",
                customerPhone: item.order?.customer?.phone || item.order?.customerPhone || "",
                eventName: event?.title || "Unknown Event",
                eventDate: eventMetadata.eventDate || "",
                ticketType: item.variant?.title || "General",
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                totalAmount: Number(item.lineTotal),
                status,
                purchasedAt: item.createdAt?.toISOString(),
                qrCode: `${item?.order?.orderNumber}-${item.id}`,
            };
        });

        return NextResponse.json(tickets, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[NIGHTLIFE_TICKETS_GET] Failed to fetch tickets", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
