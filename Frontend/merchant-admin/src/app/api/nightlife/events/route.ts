import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, OrderStatus, type ProductVariant, type Product } from "@vayva/db";
import { logger } from "@/lib/logger";

// Use Prisma's OrderStatus enum values
const VALID_ORDER_STATUSES: OrderStatus[] = ["DELIVERED", "PROCESSING"];

interface TicketTypeInput {
  name?: string;
  price?: number;
  quantity?: number;
}

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        // Get events (stored as products with productType = 'event')
        const events = await prisma.product?.findMany({
            where: { storeId, productType: "event" },
            include: {
                productImages: {
                    orderBy: { position: "asc" },
                    take: 1,
                },
                productVariants: true, // Ticket types stored as variants
            },
            orderBy: { createdAt: "desc" },
        });

        // Get ticket sales for each event
        const eventIds = events.map((e) => e.id);
        const ticketSales = await prisma.orderItem?.groupBy({
            by: ["productId"],
            where: {
                productId: { in: eventIds },
                order: { status: { in: VALID_ORDER_STATUSES } },
            },
            _sum: { quantity: true },
        });

        const salesMap = new Map(ticketSales.map((s) => [s.productId, s._sum?.quantity || 0]));

        const formattedEvents = events.map((event: Product & { productImages: { url: string }[]; productVariants: ProductVariant[]; status: string }) => {
            const metadata = (event.metadata as Record<string, string>) || {};
            const eventDate = new Date(metadata.eventDate || event.createdAt);
            const now = new Date();
            
            let status: string = event.status;
            if (eventDate < now) status = "PAST";

            return {
                id: event.id,
                title: event.title,
                description: event.description,
                eventDate: metadata.eventDate || event.createdAt,
                eventTime: metadata.eventTime || "22:00",
                venue: metadata.venue || "TBD",
                image: event.productImages?.[0]?.url || null,
                ticketsSold: salesMap.get(event.id) || 0,
                ticketTypes: event.productVariants?.map((v: ProductVariant) => ({
                    name: v.title,
                    price: Number(v.price),
                    available: v.inventory || 0,
                })),
                status,
            };
        });

        return NextResponse.json(formattedEvents, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[NIGHTLIFE_EVENTS_GET]", err.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            title,
            description,
            eventDate,
            eventTime,
            venue,
            address,
            dressCode,
            ageLimit,
            musicGenre,
            images,
            ticketTypes,
        } = body;

        if (!title || !eventDate || !eventTime || !venue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create event as a product
        const event = await prisma.product?.create({
            data: {
                storeId,
                title,
                description: description || "",
                handle: `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
                productType: "event",
                status: "ACTIVE",
                price: ticketTypes?.[0]?.price || 0,
                metadata: {
                    eventDate,
                    eventTime,
                    venue,
                    address,
                    dressCode,
                    ageLimit,
                    musicGenre,
                },
                productImages: images?.length > 0 ? {
                    create: images.map((url: string, i: number) => ({
                        url,
                        position: i,
                    })),
                } : undefined,
                productVariants: ticketTypes?.length > 0 ? {
                    create: ticketTypes.map((t: TicketTypeInput, i: number) => ({
                        title: t.name || `Ticket ${i + 1}`,
                        price: t.price || 0,
                        sku: `${title.substring(0, 3).toUpperCase()}-${t.name?.toUpperCase() || i}`,
                        inventory: t.quantity || 100,
                    })),
                } : undefined,
            },
        });

        return NextResponse.json({ success: true, id: event.id });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[NIGHTLIFE_EVENTS_POST]", err.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
