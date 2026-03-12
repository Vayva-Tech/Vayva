import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { startOfDay, endOfDay } from "date-fns";

export const GET = withVayvaAPI(PERMISSIONS.ORDERS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter") || "tonight";

        // Get reservations from bookings table
        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let dateFilter: any = {};

        switch (filter) {
            case "tonight":
                dateFilter = {
                    startsAt: {
                        gte: startOfDay(now),
                        lte: endOfDay(now),
                    },
                };
                break;
            case "upcoming":
                dateFilter = {
                    startsAt: {
                        gt: endOfDay(now),
                    },
                };
                break;
            case "past":
                dateFilter = {
                    startsAt: {
                        lt: startOfDay(now),
                    },
                };
                break;
            default:
                dateFilter = {};
        }

        const bookings = await prisma.booking?.findMany({
            where: {
                storeId,
                ...dateFilter,
            },
            include: {
                customer: {
                    select: { firstName: true, lastName: true, email: true, phone: true },
                },
                service: {
                    select: { title: true, metadata: true },
                },
            },
            orderBy: { startsAt: "asc" },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservations = bookings.map((booking: any) => {
            const metadata = (booking.metadata as Record<string, unknown>) || {};
            const serviceMetadata = (booking.service?.metadata as Record<string, unknown>) || {};

            return {
                id: booking.id,
                guestName: booking.customer
                    ? `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim()
                    : metadata.guestName || "Guest",
                guestPhone: booking.customer?.phone || metadata.guestPhone || "",
                guestEmail: booking.customer?.email || metadata.guestEmail || "",
                tableName: booking.service?.title || metadata.tableName || "Table",
                tableType: serviceMetadata.tableType || metadata.tableType || "Standard",
                date: booking.startsAt?.toISOString().split("T")[0],
                time: booking.startsAt?.toTimeString().substring(0, 5),
                partySize: metadata.partySize || 2,
                minimumSpend: serviceMetadata.minimumSpend || metadata.minimumSpend || 0,
                bottles: metadata.bottles || [],
                totalAmount: metadata.totalAmount || Number(booking.totalPrice) || 0,
                status: (booking as any).status,
                specialRequests: metadata.specialRequests || booking.notes || "",
                createdAt: booking.createdAt?.toISOString(),
            };
        });

        return NextResponse.json(reservations, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[NIGHTLIFE_RESERVATIONS_GET] Failed to fetch reservations", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            guestName,
            guestPhone,
            guestEmail,
            tableId,
            date,
            time,
            partySize,
            bottles,
            specialRequests,
        } = body;

        if (!guestName || !guestPhone || !tableId || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get table info
        const table = await prisma.product?.findFirst({
            where: { id: tableId, storeId, productType: "SERVICE" },
        });

        if (!table) {
            return NextResponse.json({ error: "Table not found" }, { status: 404 });
        }

        const tableMetadata = (table.metadata as Record<string, unknown>) || {};
        const minimumSpend = Number(tableMetadata.minimumSpend) || 0;

        // Calculate total from bottles
        let bottlesTotal = 0;
        if (bottles?.length > 0) {
            for (const bottle of bottles) {
                bottlesTotal += (bottle.price || 0) * (bottle.quantity || 1);
            }
        }

        const totalAmount = Math.max(bottlesTotal, minimumSpend);

        // Create booking
        const startsAt = new Date(`${date}T${time || "22:00"}:00`);
        const endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1000); // 4 hours

        const booking = await prisma.booking?.create({
            data: {
                storeId,
                serviceId: tableId,
                startsAt,
                endsAt,
                status: "PENDING" as any,
                notes: specialRequests,
                metadata: {
                    guestName,
                    guestPhone,
                    guestEmail,
                    partySize,
                    bottles,
                    totalAmount,
                    minimumSpend,
                    specialRequests,
                },
            },
        });

        return NextResponse.json({ success: true, id: booking.id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[NIGHTLIFE_RESERVATIONS_POST] Failed to create reservation", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
