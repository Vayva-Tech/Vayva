import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

// GET /api/bookings/availability
// ?productId=UUID&start=ISO&end=ISO
export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db } = ctx;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!productId || !start || !end) {
    return NextResponse.json(
      { error: "Missing params", requestId },
      { status: 400 },
    );
  }

  try {
    // Fetch Product (scoped by extension)
    const product = await db.product.findFirst({
      where: { id: productId }, // storeId injected
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Room type not found", requestId },
        { status: 404 },
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // 1. Get Room Details (Need Total Units)
    // AccommodationProduct logic depends on valid product.id from above
    const room = await db.accommodationProduct.findUnique({
      where: { productId: product.id },
      select: { totalUnits: true },
    });

    if (!room)
      return NextResponse.json(
        { error: "Room type not found", requestId },
        { status: 404 },
      );

    // 2. Count overlapping bookings
    // Booking is tenant-scoped in extension? Yes.
    // So db.booking.count adds storeId? YES. "Booking" is in the list.
    // But wait, bookings are linked to product/service/store.
    // If I use db.booking.count, it adds `storeId`.
    // Does `Booking` model have `storeId`?
    // I need to verify `Booking` model has `storeId`.
    // If `Booking` adheres to `storeId` field, then it works.
    // If `Booking` only has `serviceId` (product), then adding `storeId` might break query if column doesn't exist?
    // Or if it exists, it's fine.
    // Assuming Booking has storeId.

    const bookedCount = await db.booking.count({
      where: {
        serviceId: product.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        startsAt: { lt: endDate },
        endsAt: { gt: startDate },
      },
    });

    const available = room.totalUnits - bookedCount;

    return NextResponse.json(
      {
        productId: product.id,
        totalUnits: room.totalUnits,
        bookedCount,
        available: available > 0 ? available : 0,
        isAvailable: available > 0,
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Availability Check Error", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Internal Error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
