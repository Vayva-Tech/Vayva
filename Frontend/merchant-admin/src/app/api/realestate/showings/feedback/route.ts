import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/showings/feedback - Get showing feedback
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const showingId = searchParams.get("showingId");
      const propertyId = searchParams.get("propertyId");
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = {};

      if (showingId) {
        where.showingId = showingId;
      }

      if (propertyId) {
        // Need to join with PropertyShowing to filter by propertyId
        const showingIds = await prisma.propertyShowing.findMany({
          where: { merchantId: storeId, propertyId },
          select: { id: true }
        });
        where.showingId = { in: showingIds.map(s => s.id) };
      }

      const feedback = await prisma.showingFeedback.findMany({
        where,
        include: {
          showing: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  address: true,
                  city: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      });

      const total = await prisma.showingFeedback.count({ where });

      return NextResponse.json({
        success: true,
        data: {
          feedback,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_FEEDBACK_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch showing feedback" },
        { status: 500 }
      );
    }
  }
);

// POST /api/realestate/showings/feedback - Submit showing feedback
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        showingId,
        clientName,
        clientEmail,
        clientPhone,
        interestLevel,
        rating,
        feedback: feedbackText,
        concerns,
        positivePoints,
        wouldMakeOffer,
        offerPriceRange,
        agentNotes,
        followUpRequired
      } = body;

      if (!showingId) {
        return NextResponse.json(
          { success: false, error: "Showing ID is required" },
          { status: 400 }
        );
      }

      // Verify showing exists
      const showing = await prisma.propertyShowing.findUnique({
        where: { id: showingId, merchantId: storeId },
        include: { property: true }
      });

      if (!showing) {
        return NextResponse.json(
          { success: false, error: "Showing not found" },
          { status: 404 }
        );
      }

      // Check if feedback already exists
      const existingFeedback = await prisma.showingFeedback.findUnique({
        where: { showingId }
      });

      if (existingFeedback) {
        return NextResponse.json(
          { success: false, error: "Feedback already submitted for this showing" },
          { status: 409 }
        );
      }

      const createdFeedback = await prisma.showingFeedback.create({
        data: {
          showingId,
          clientName,
          clientEmail,
          clientPhone,
          interestLevel: interestLevel || 'neutral',
          rating: rating || 3,
          feedback: feedbackText,
          concerns: concerns ? JSON.stringify(concerns) : null,
          positivePoints: positivePoints ? JSON.stringify(positivePoints) : null,
          wouldMakeOffer: wouldMakeOffer || false,
          offerPriceRange: offerPriceRange ? JSON.stringify(offerPriceRange) : null,
          agentNotes,
          followUpRequired: followUpRequired || false,
          submittedAt: new Date()
        },
        include: {
          showing: {
            include: {
              property: true
            }
          }
        }
      });

      // Update showing status to completed if feedback is submitted
      await prisma.propertyShowing.update({
        where: { id: showingId },
        data: {
          status: 'completed',
          feedbackId: createdFeedback.id
        }
      });

      return NextResponse.json({
        success: true,
        data: createdFeedback,
        message: "Feedback submitted successfully"
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_FEEDBACK_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to submit feedback" },
        { status: 500 }
      );
    }
  }
);
