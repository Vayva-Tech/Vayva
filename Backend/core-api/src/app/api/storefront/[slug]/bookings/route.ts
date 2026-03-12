import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const serviceId = getString(body.serviceId);
    const date = getString(body.date);
    const time = getString(body.time);
    const customerEmail = getString(body.customerEmail);
    const customerName = getString(body.customerName);
    const notes = getString(body.notes);
    if (!serviceId || !date || !time || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
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
          email: customerEmail,
        },
      },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          storeId: store.id,
          email: customerEmail,
          firstName: customerName || "Guest",
          lastName: "",
        },
      });
    }
    // Construct DateTime
    // date is YYYY-MM-DD, time is HH:mm
    const startsAt = new Date(`${date}T${time}:00.000Z`);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // Default 1 hour duration
    // Create Booking
    const bookingDelegate = prisma.booking;
    if (!bookingDelegate) {
      return NextResponse.json(
        { error: "Booking system not initialized" },
        { status: 503 },
      );
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
      },
    });
    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    logger.error("[STOREFRONT_BOOKINGS]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
