import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const { response, responderType, responderId } = json;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify review exists
    const review = await prisma.wellnessReview.findFirst({
      where: { id, storeId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    if (!response || response.length < 10) {
      return NextResponse.json(
        { error: "Response must be at least 10 characters long" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Create response record
    const reviewResponse = await prisma.wellnessReviewResponse.create({
      data: {
        storeId,
        reviewId: id,
        response,
        responderType,
        responderId,
      },
      include: {
        review: {
          select: {
            rating: true,
            title: true,
            comment: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(reviewResponse, {
      headers: standardHeaders(requestId),
    });
  } catch (error: unknown) {
    logger.error("[WELLNESS_REVIEW_RESPOND_POST]", { error, reviewId: params.id });
    return NextResponse.json(
      { error: "Failed to respond to review" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}