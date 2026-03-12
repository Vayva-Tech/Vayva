import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getTenantFromHost } from "@/lib/tenant";
import { standardHeaders, logger } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId } = ctx;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "8");
  const sort = searchParams.get("sort") || "newest";
  const collectionSlug = searchParams.get("collection");

  const t = await getTenantFromHost(request.headers.get("host") || undefined);
  if (!t.ok) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const store = await prisma.store.findUnique({
    where: { slug: t.slug },
    select: { id: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      storeId: store.id,
      status: "ACTIVE", // Only public products
    };

    if (collectionSlug) {
      where.collections = {
        some: {
          slug: collectionSlug,
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };

    const products = await prisma.product.findMany({
      where,
      take: Math.min(limit, 50),
      orderBy,
      select: {
        id: true,
        title: true,
        handle: true,
        description: true,
        price: true,
        compareAtPrice: true,
        productImages: {
          orderBy: { position: "asc" },
          take: 5,
          select: { url: true },
        },
      },
    });

    const transformed = products.map((p) => ({
      id: p.id,
      name: p.title,
      handle: p.handle,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      images: p.productImages.map((img) => img.url),
      url: `/products/${p.handle}`,
    }));

    const response = NextResponse.json(
      { data: transformed },
      { headers: standardHeaders(requestId) },
    );
    // Cache for 60 seconds
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=30",
    );
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("Failed to fetch storefront products", {
      error: error instanceof Error ? error.message : String(error),
      storeId: store.id,
      requestId,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
