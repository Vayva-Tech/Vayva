import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

  try {
    const stays = await db.accommodationProduct.findMany({
      where: {
        product: {
          storeId,
          status: "ACTIVE",
        },
      },
      take: limit,
      orderBy: { product: { updatedAt: "desc" } },
      select: {
        type: true,
        maxGuests: true,
        totalUnits: true,
        product: {
          select: {
            id: true,
            title: true,
            handle: true,
            description: true,
            price: true,
            productImages: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    const formatted = stays.map((s: any) => ({
      id: s.product.id,
      title: s.product.title,
      description: s.product.description || null,
      price: Number(s.product.price),
      image: s.product.productImages?.[0]?.url || null,
      slug: s.product.handle,
      stayDetails: {
        type: String(s.type),
        maxGuests: s.maxGuests,
        totalUnits: s.totalUnits,
      },
    }));

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch stays", {
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
