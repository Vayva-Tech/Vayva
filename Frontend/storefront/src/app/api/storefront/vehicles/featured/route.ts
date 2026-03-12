import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (_request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;

  try {
    const vehicles = await db.vehicleProduct.findMany({
      where: {
        product: {
          storeId,
          status: "ACTIVE",
        },
      },
      take: 12,
      orderBy: [{ year: "desc" }],
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        mileage: true,
        fuelType: true,
        product: {
          select: {
            id: true,
            title: true,
            handle: true,
            price: true,
            description: true,
            productImages: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    const transformed = vehicles.map((v: any) => ({
      id: v.product.id,
      title: v.product.title,
      make: v.make,
      model: v.model,
      year: v.year,
      price: Number(v.product.price),
      mileage: v.mileage,
      fuelType: String(v.fuelType),
      image: v.product.productImages?.[0]?.url || "/placeholder.png",
      slug: v.product.handle,
    }));

    return NextResponse.json(
      { vehicles: transformed, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch featured vehicles", {
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
