import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

function toDayRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function buildSlots(dateStr: string): string[] {
  // Simple office-hours schedule; can be made configurable per store later.
  // Slots are ISO strings.
  const base = new Date(dateStr);
  base.setHours(0, 0, 0, 0);

  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour += 1) {
    const d = new Date(base);
    d.setHours(hour, 0, 0, 0);
    slots.push(d.toISOString());
  }
  return slots;
}

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "Missing params", requestId },
      { status: 400, headers: standardHeaders(requestId) },
    );
  }

  try {
    const service = await db.product.findFirst({
      where: { id: serviceId, storeId, status: "ACTIVE", productType: "SERVICE" },
      select: { id: true, metadata: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    const { start, end } = toDayRange(date);

    const existing = await db.booking.findMany({
      where: {
        storeId,
        serviceId: service.id,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        startsAt: { gte: start, lt: end },
      },
      select: { startsAt: true },
    });

    const booked = new Set(existing.map((b: any) => new Date(b.startsAt).toISOString()));
    const allSlots = buildSlots(date);
    const availableSlots = allSlots.filter((s) => !booked.has(s));

    return NextResponse.json(
      { data: { serviceId: service.id, date, slots: availableSlots }, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Failed to fetch booking slots", {
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
