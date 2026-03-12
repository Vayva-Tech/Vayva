/**
 * Showing Feedback API Routes
 * POST /api/realestate/showings/[id]/feedback - Submit feedback
 * GET /api/realestate/showings/[id]/feedback - Get feedback
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Submit Feedback
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;
      const body = await request.json();

      // Verify showing exists and belongs to store
      const showing = await prisma.propertyShowing.findFirst({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!showing) {
        return NextResponse.json(
          { error: "Showing not found" },
          { status: 404 }
        );
      }

      const {
        sentiment,
        interestLevel,
        priceOpinion,
        propertyCondition,
        locationOpinion,
        likedFeatures,
        dislikedFeatures,
        concerns,
        additionalComments,
        followUpRequested,
        followUpDate,
        estimatedOfferPrice,
        rating,
      } = body;

      if (!sentiment || !interestLevel || rating === undefined) {
        return NextResponse.json(
          { error: "Sentiment, interest level, and rating are required" },
          { status: 400 }
        );
      }

      // Create feedback
      const feedback = await prisma.showingFeedback.create({
        data: {
          showingId: id,
          sentiment,
          interestLevel,
          priceOpinion,
          propertyCondition,
          locationOpinion,
          likedFeatures: likedFeatures || [],
          dislikedFeatures: dislikedFeatures || [],
          concerns: concerns || [],
          additionalComments,
          followUpRequested: followUpRequested || false,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
          estimatedOfferPrice,
          rating,
        },
      });

      // Update showing status to completed if not already
      if (showing.status !== "completed") {
        await prisma.propertyShowing.update({
          where: { id },
          data: { status: "completed" },
        });
      }

      return NextResponse.json({
        success: true,
        data: feedback,
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_FEEDBACK_POST]", error, { storeId, showingId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET Feedback
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      const feedback = await prisma.showingFeedback.findFirst({
        where: {
          showingId: id,
        },
      });

      if (!feedback) {
        return NextResponse.json(
          { error: "Feedback not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: feedback,
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_FEEDBACK_GET]", error, { storeId, showingId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
