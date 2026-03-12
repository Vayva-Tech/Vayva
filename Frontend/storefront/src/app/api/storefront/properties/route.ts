import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 60);
  const q = searchParams.get("q")?.trim() || "";
  const city = searchParams.get("city")?.trim() || "";
  const state = searchParams.get("state")?.trim() || "";
  const purpose = searchParams.get("purpose")?.trim() || "";

  try {
    const properties = await db.property.findMany({
      where: {
        storeId,
        status: "available",
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(state ? { state: { contains: state, mode: "insensitive" } } : {}),
        ...(purpose ? { purpose } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        purpose: true,
        type: true,
        price: true,
        currency: true,
        address: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        featured: true,
        images: true,
      },
    });

    const formatted = properties.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      purpose: String(p.purpose),
      type: String(p.type),
      price: Number(p.price),
      currency: p.currency,
      address: p.address,
      city: p.city,
      state: p.state,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      featured: Boolean(p.featured),
      image: Array.isArray(p.images) && p.images.length ? p.images[0] : null,
      images: p.images,
    }));

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch properties", {
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
