import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db } = ctx;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 50);

  try {
    const posts = await db.blogPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(
      {
        data: posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || null,
          featuredImage: p.featuredImage || null,
          publishedAt: p.publishedAt,
        })),
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Failed to fetch storefront posts", {
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
