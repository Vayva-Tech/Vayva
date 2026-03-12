import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getTenantFromHost } from "@/lib/tenant";
import { standardHeaders, logger } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId } = ctx;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");

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
    const collections = await prisma.collection.findMany({
      where: {
        storeId: store.id,
      },
      take: Math.min(limit, 50),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        handle: true,
        description: true,
        _count: {
          select: { collectionProducts: true },
        },
      },
    });

    const transformed = collections.map((c) => ({
      id: c.id,
      name: c.title,
      slug: c.handle,
      description: c.description,
      imageUrl: null, // Collection model doesn't have imageUrl yet
      productCount: c._count.collectionProducts,
      url: `/collections/${c.handle}`,
    }));

    const response = NextResponse.json(
      { data: transformed },
      { headers: standardHeaders(requestId) },
    );
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60",
    );
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("Failed to fetch storefront collections", {
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
