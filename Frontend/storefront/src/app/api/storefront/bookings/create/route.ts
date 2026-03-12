import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const POST = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;

  try {
    const body = await request.json();
    const serviceId = String(body?.serviceId || "");
    const startsAt = String(body?.startsAt || "");
    const endsAt = String(body?.endsAt || "");
    const name = String(body?.name || "");
    const email = body?.email ? String(body.email) : null;
    const phone = body?.phone ? String(body.phone) : null;
    const notes = body?.notes ? String(body.notes) : null;

    if (!serviceId || !startsAt || !endsAt || !name) {
      return NextResponse.json(
        { error: "Missing required fields", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      return NextResponse.json(
        { error: "Invalid time range", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const service = await db.product.findFirst({
      where: { id: serviceId, status: "ACTIVE", productType: "SERVICE" },
      select: { id: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    // Prevent double booking the same slot.
    const overlap = await db.booking.findFirst({
      where: {
        serviceId: service.id,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        startsAt: { lt: endDate },
        endsAt: { gt: startDate },
      },
      select: { id: true },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Slot already booked", requestId },
        { status: 409, headers: standardHeaders(requestId) },
      );
    }

    const booking = await db.booking.create({
      data: {
        storeId,
        serviceId: service.id,
        startsAt: startDate,
        endsAt: endDate,
        status: "PENDING",
        metadata: {
          name,
          email,
          phone,
          notes,
          source: "commerce-block",
        },
      },
      select: { id: true },
    });

    return NextResponse.json(
      { data: { bookingId: booking.id }, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Failed to create booking", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
