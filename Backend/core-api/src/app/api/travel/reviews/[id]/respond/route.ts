import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ReviewResponseSchema = z.object({
  response: z.string().min(1, "Response is required"),
  status: z.enum(["approved", "rejected"]).optional(),
});

export const PUT = withVayvaAPI(
  PERMISSIONS.REVIEWS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = ReviewResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid response data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check if review exists
      const existingReview = await prisma.travelReview.findFirst({
        where: { id, storeId },
      });

      if (!existingReview) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Can only respond to approved reviews
      if (existingReview.status !== "approved") {
        return NextResponse.json(
          { error: "Can only respond to approved reviews" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Check if already responded
      if (existingReview.merchantResponse) {
        return NextResponse.json(
          { error: "Review already has a response" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const updateData: any = {
        merchantResponse: body.response,
        respondedAt: new Date(),
        respondedBy: user?.id || "system",
      };

      if (body.status) updateData.status = body.status;

      const upd = await prisma.travelReview.updateMany({
        where: { id, storeId },
        data: updateData,
      });

      if (upd.count === 0) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      const review = await prisma.travelReview.findFirst({
        where: { id, storeId },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      return NextResponse.json(review, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_REVIEW_RESPOND_PUT]", { error, reviewId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to respond to review" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);