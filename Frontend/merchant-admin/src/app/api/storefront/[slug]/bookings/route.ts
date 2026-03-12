import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any, { params }: any) {
    try {
        const { slug } = await params;
        const body = await req.json();
        const { serviceId, date, time, customerEmail, customerName, notes } = body;
        if (!serviceId || !date || !time || !customerEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const store = await prisma.store.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        // Upsert Customer
        let customer = await prisma.customer.findUnique({
            where: {
                storeId_email: {
                    storeId: store.id,
                    email: customerEmail
                }
            }
        });
        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    storeId: store.id,
                    email: customerEmail,
                    firstName: customerName || "Guest",
                    lastName: "",
                }
            });
        }
        // Construct DateTime
        // date is YYYY-MM-DD, time is HH:mm
        const startsAt = new Date(`${date}T${time}:00.000Z`);
        const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // Default 1 hour duration
        // Create Booking
        const bookingDelegate = prisma.booking;
        if (!bookingDelegate) {
            return NextResponse.json({ error: "Booking system not initialized" }, { status: 503 });
        }
        const booking = await bookingDelegate.create({
            data: {
                storeId: store.id,
                customerId: customer.id,
                serviceId, // Assumption: serviceId is valid Product ID
                startsAt,
                endsAt,
                status: "CONFIRMED",
                notes,
            }
        });
        return NextResponse.json({ success: true, bookingId: booking.id });
    }
    catch (error) {
        const storeSlug = (await params).slug;
        logger.error("[STOREFRONT_BOOKINGS_POST] Failed to create booking", { storeSlug, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
