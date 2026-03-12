import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const eventId = searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json(
      { error: "Missing eventId", requestId },
      { status: 400, headers: standardHeaders(requestId) },
    );
  }

  try {
    const event = await db.event.findFirst({
      where: { id: eventId, storeId, isPublic: true, status: "published" },
      select: {
        id: true,
        title: true,
        description: true,
        venue: true,
        address: true,
        startDate: true,
        endDate: true,
        timezone: true,
        capacity: true,
        bannerImage: true,
        category: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    const tiers = await db.ticketTier.findMany({
      where: {
        eventId: event.id,
        isActive: true,
        salesStart: { lte: new Date() },
        salesEnd: { gte: new Date() },
      },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        remaining: true,
        maxPerOrder: true,
      },
    });

    const formatted = {
      ...event,
      description: event.description || null,
      venue: event.venue || null,
      address: event.address || null,
      bannerImage: event.bannerImage || null,
      ticketTiers: tiers.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description || null,
        price: Number(t.price),
        remaining: t.remaining,
        maxPerOrder: t.maxPerOrder,
      })),
    };

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch storefront event", {
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
