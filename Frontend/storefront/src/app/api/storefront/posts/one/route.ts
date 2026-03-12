import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db } = ctx;
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json(
      { error: "postId is required", requestId },
      { status: 400, headers: standardHeaders(requestId) },
    );
  }

  try {
    const post = await db.blogPost.findFirst({
      where: {
        id: postId,
        status: "PUBLISHED",
      },
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
        data: post
          ? {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt || null,
              featuredImage: post.featuredImage || null,
              publishedAt: post.publishedAt,
            }
          : null,
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Failed to fetch storefront post", {
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
