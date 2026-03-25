import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.REVIEWS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let reviewIdForLog = "";
    try {
      const { id } = await params;
      reviewIdForLog = id;

      const review = await prisma.wellnessReview.findFirst({
        where: { id, storeId },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
          responses: {
            where: { storeId },
            select: {
              id: true,
              response: true,
              responderType: true,
              createdAt: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const reviewWithDetails = {
        ...review,
        tags: JSON.parse(review.tags || "[]"),
        clientName: review.anonymous
          ? "Anonymous"
          : `${review.client.firstName} ${review.client.lastName}`,
        instructorName: `${review.instructor.firstName} ${review.instructor.lastName}`,
        hasResponse: review.responses.length > 0,
        responseCount: review.responses.length,
      };

      return NextResponse.json(
        { data: reviewWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_REVIEW_GET]", { error, reviewId: reviewIdForLog });
      return NextResponse.json(
        { error: "Failed to fetch review" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
