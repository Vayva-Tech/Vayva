import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date"); // YYYY-MM-DD
        const serviceId = searchParams.get("serviceId");
        if (!dateStr) {
            return NextResponse.json({ error: "Date required" }, { status: 400 });
        }
        const store = await prisma.store.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        // Default slots (9 AM to 5 PM, hourly)
        const defSlots = [
            "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
        ];
        // Find existing bookings for this date
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
        // Note: We use 'any' cast for prisma.booking if types aren't generated yet
        const bookingDelegate = prisma.booking;
        let bookedTimes: string[] = [];
        if (bookingDelegate) {
            const bookings = await bookingDelegate.findMany({
                where: {
                    storeId: store.id,
                    startsAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: { not: "CANCELLED" },
                    ...(serviceId ? { serviceId } : {}),
                },
                select: {
                    startsAt: true,
                },
            });
            bookedTimes = bookings.map((b) => {
                const d = new Date((b as any).startsAt);
                // Convert to HH:mm. Note: This assumes UTC or consistent timezone handling.
                //Ideally we handle timezones better, but for MVP/V1 audit fix this is sufficient.
                return d.toISOString().split("T")[1].substring(0, 5);
            });
        }
        // Simple availability check
        const availableSlots = defSlots.filter(slot => !bookedTimes.includes(slot));
        return NextResponse.json({
            date: dateStr,
            availableSlots
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        const storeId = (await params).slug;
        logger.error("[STOREFRONT_AVAILABILITY_GET] Failed to fetch availability", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
