import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Product, type ProductVariant } from "@vayva/db";
import { logger } from "@/lib/logger";

type OrderStatus = "DELIVERED" | "PROCESSING" | "PENDING" | "CANCELLED";

const VALID_ORDER_STATUSES: OrderStatus[] = ["DELIVERED", "PROCESSING"];

interface TicketSales {
  sold: number;
  revenue: number;
}

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        const event = await prisma.product?.findFirst({
            where: { id, storeId, productType: "event" },
            include: {
                productImages: { orderBy: { position: "asc" } },
                productVariants: true,
            },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Get ticket sales
        const ticketSales = await prisma.orderItem?.groupBy({
            by: ["variantId"],
            where: {
                productId: id,
                order: { status: { in: VALID_ORDER_STATUSES as any } },
            },
            _sum: { quantity: true, price: true },
        });

        const salesByVariant = new Map<string, TicketSales>(
            ticketSales.map((s) => [s.variantId ?? "", { sold: s._sum?.quantity || 0, revenue: Number(s._sum?.price || 0) * (s._sum?.quantity || 0) }])
        );

        const metadata = (event.metadata as Record<string, unknown>) || {};
        const totalSold = ticketSales.reduce((sum: any, s: any) => sum + (s._sum?.quantity || 0), 0);
        const totalRevenue = ticketSales.reduce((sum: any, s: any) => sum + (Number(s._sum?.price || 0) * (s._sum?.quantity || 0)), 0);

        return NextResponse.json({
            id: event.id,
            title: event.title,
            description: event.description,
            eventDate: metadata.eventDate,
            eventTime: metadata.eventTime,
            venue: metadata.venue,
            address: metadata.address,
            dressCode: metadata.dressCode,
            ageLimit: metadata.ageLimit,
            musicGenre: metadata.musicGenre,
            images: event.productImages?.map((img) => img.url),
            ticketTypes: (event.productVariants as ProductVariant[]).map((v) => {
                const sales = salesByVariant.get(v.id) || { sold: 0, revenue: 0 };
                return {
                    id: v.id,
                    name: v.title,
                    price: Number(v.price),
                    quantity: v.inventory || 0,
                    sold: sales.sold,
                    description: v.sku || "",
                };
            }),
            status: (event as any).status,
            ticketsSold: totalSold,
            revenue: totalRevenue,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        const resolvedParams = await Promise.resolve(params);
        logger.error("[NIGHTLIFE_EVENT_GET] Failed to fetch event", { storeId, id: resolvedParams.id, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const body = await req.json().catch(() => ({})) as {
            title?: string;
            description?: string;
            eventDate?: string;
            eventTime?: string;
            venue?: string;
            address?: string;
            dressCode?: string;
            ageLimit?: number;
            musicGenre?: string;
            images?: string[];
            ticketTypes?: Array<{ id?: string; name?: string; price?: number }>;
        };

        // Verify event belongs to store
        const existingEvent = await prisma.product?.findFirst({
            where: { id, storeId, productType: "event" },
        });

        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

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

        // Update event
        await prisma.product?.update({
            where: { id },
            data: {
                title: title || existingEvent.title,
                description: description || existingEvent.description,
                metadata: {
                    ...((existingEvent.metadata as Record<string, unknown>) || {}),
                    eventDate,
                    eventTime,
                    venue,
                    address,
                    dressCode,
                    ageLimit,
                    musicGenre,
                },
            },
        });

        // Update images if provided
        if (images && images.length > 0) {
            await prisma.productImage?.deleteMany({ where: { productId: id } });
            await prisma.productImage?.createMany({
                data: images.map((url: string, i: number) => ({
                    productId: id,
                    url,
                    position: i,
                })),
            });
        }

        // Update ticket types (variants)
        if (ticketTypes && ticketTypes.length > 0) {
            for (const ticket of ticketTypes) {
                if (ticket.id) {
                    await prisma.productVariant?.updateMany({
                        where: { id: ticket.id, productId: id },
                        data: {
                            title: ticket.name,
                            price: ticket.price,
                        },
                    });
                } else {
                    await prisma.productVariant?.create({
                        data: {
                            storeId,
                            productId: id,
                            title: ticket.name || "Ticket",
                            price: ticket.price || 0,
                            sku: `${(title || existingEvent.title)?.substring(0, 3).toUpperCase() || "EVT"}-${ticket.name?.toUpperCase() || "NEW"}`,
                            options: [],
                        },
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        const resolvedParams = await Promise.resolve(params);
        logger.error("[NIGHTLIFE_EVENT_PATCH] Failed to update event", { storeId, id: resolvedParams.id, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        // Verify event belongs to store
        const event = await prisma.product?.findFirst({
            where: { id, storeId, productType: "event" },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if any tickets sold
        const ticketsSold = await prisma.orderItem?.count({
            where: { productId: id },
        });

        if (ticketsSold > 0) {
            return NextResponse.json(
                { error: "Cannot delete event with ticket sales. Archive it instead." },
                { status: 400 }
            );
        }

        // Delete dependencies first
        await prisma.productVariant?.deleteMany({ where: { productId: id } });
        await prisma.productImage?.deleteMany({ where: { productId: id } });
        
        // Delete event
        await prisma.product?.deleteMany({
            where: { id, storeId }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        const resolvedParams = await Promise.resolve(params);
        logger.error("[NIGHTLIFE_EVENT_DELETE] Failed to delete event", { storeId, id: resolvedParams.id, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
