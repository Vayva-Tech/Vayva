import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const upcoming = searchParams.get("upcoming") === "true";

  try {
    const now = new Date();

    const events = await db.event.findMany({
      where: {
        storeId,
        isPublic: true,
        status: "published",
        ...(upcoming ? { startDate: { gte: now } } : {}),
      },
      orderBy: { startDate: "asc" },
      take: limit,
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

    const formatted = events.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description || null,
      venue: e.venue || null,
      address: e.address || null,
      startDate: e.startDate,
      endDate: e.endDate,
      timezone: e.timezone,
      capacity: e.capacity,
      bannerImage: e.bannerImage || null,
      category: e.category,
    }));

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch storefront events", {
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
