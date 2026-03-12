import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

// GET /api/vehicles
// ?type=years
// ?type=makes&year=2024
// ?type=models&year=2024&make=Toyota
export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId } = ctx;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const t = await getTenantFromHost(request.headers.get("host") || undefined);
  if (!t.ok) {
    return NextResponse.json(
      { error: "Store not found", requestId },
      { status: 404 },
    );
  }

  const store = await prisma.store.findUnique({
    where: { slug: t.slug },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json(
      { error: "Store not found", requestId },
      { status: 404 },
    );
  }

  try {
    if (type === "years") {
      // Get distinct years
      const years = await prisma.vehicleProduct.groupBy({
        by: ["year"],
        where: { product: { storeId: store.id } },
        orderBy: { year: "desc" },
      });
      return NextResponse.json(
        { years: years.map((y) => y.year), requestId },
        { headers: standardHeaders(requestId) },
      );
    }

    if (type === "makes") {
      const year = parseInt(searchParams.get("year") || "0");
      const makes = await prisma.vehicleProduct.groupBy({
        by: ["make"],
        where: {
          year: year || undefined,
          product: { storeId: store.id },
        },
        orderBy: { make: "asc" },
      });
      return NextResponse.json(
        { makes: makes.map((m) => m.make), requestId },
        { headers: standardHeaders(requestId) },
      );
    }

    if (type === "models") {
      const year = parseInt(searchParams.get("year") || "0");
      const make = searchParams.get("make");

      if (!make)
        return NextResponse.json(
          { models: [], requestId },
          { headers: standardHeaders(requestId) },
        );

      const models = await prisma.vehicleProduct.groupBy({
        by: ["model"],
        where: {
          year: year || undefined,
          make: make,
          product: { storeId: store.id },
        },
        orderBy: { model: "asc" },
      });
      return NextResponse.json(
        { models: models.map((m) => m.model), requestId },
        { headers: standardHeaders(requestId) },
      );
    }

    return NextResponse.json(
      { error: "Invalid type", requestId },
      { status: 400, headers: standardHeaders(requestId) },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Vehicle API Error", {
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
