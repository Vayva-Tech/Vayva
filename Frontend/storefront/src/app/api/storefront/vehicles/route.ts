import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 60);
  const year = searchParams.get("year");
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  try {
    const vehicles = await db.vehicleProduct.findMany({
      where: {
        ...(year ? { year: Number(year) } : {}),
        ...(make ? { make } : {}),
        ...(model ? { model } : {}),
        product: {
          storeId,
          status: "ACTIVE",
        },
      },
      take: limit,
      orderBy: [{ year: "desc" }],
      select: {
        make: true,
        model: true,
        year: true,
        mileage: true,
        fuelType: true,
        transmission: true,
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
      transmission: String(v.transmission),
      image: v.product.productImages?.[0]?.url || "/placeholder.png",
      slug: v.product.handle,
      description: v.product.description || null,
    }));

    return NextResponse.json(
      { data: transformed, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch vehicles", {
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
