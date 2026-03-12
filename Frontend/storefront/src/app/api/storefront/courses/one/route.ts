import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const courseId = searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json(
      { error: "Missing courseId", requestId },
      { status: 400, headers: standardHeaders(requestId) },
    );
  }

  try {
    const course = await db.course.findFirst({
      where: { id: courseId, storeId, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        price: true,
        currency: true,
        duration: true,
        level: true,
        category: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    return NextResponse.json(
      {
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl || null,
          price: Number(course.price),
          currency: course.currency,
          duration: course.duration,
          level: String(course.level),
          category: course.category,
        },
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch course", {
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
