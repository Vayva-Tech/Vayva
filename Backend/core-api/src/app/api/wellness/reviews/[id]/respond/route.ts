import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const POST = withVayvaAPI(
  PERMISSIONS.REVIEWS_MANAGE,
  async (req: NextRequest, { storeId, params, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    let reviewIdForLog = "";
    try {
      const { id } = await params;
      reviewIdForLog = id;
      const json = await req.json().catch(() => ({}));
      const { response, responderType, responderId } = json as {
        response?: string;
        responderType?: string;
        responderId?: string;
      };

      const review = await prisma.wellnessReview.findFirst({
        where: { id, storeId },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      if (!response || response.length < 10) {
        return NextResponse.json(
          { error: "Response must be at least 10 characters long" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const reviewResponse = await prisma.wellnessReviewResponse.create({
        data: {
          storeId,
          reviewId: id,
          response,
          responderType: responderType ?? "staff",
          responderId: responderId ?? user.id,
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
      logger.error("[WELLNESS_REVIEW_RESPOND_POST]", {
        error,
        reviewId: reviewIdForLog,
        storeId,
        userId: user?.id,
      });
      return NextResponse.json(
        { error: "Failed to respond to review" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
