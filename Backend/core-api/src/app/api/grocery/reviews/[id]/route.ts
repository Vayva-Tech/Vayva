import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ReviewUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  adminNotes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.REVIEWS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const review = await prisma.groceryProductReview.findFirst({
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
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      return NextResponse.json(
        { data: review },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: reviewId } = await params;
      logger.error("[GROCERY_REVIEW_GET]", { error, reviewId });
      return NextResponse.json(
        { error: "Failed to fetch review" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.REVIEWS_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = ReviewUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid review data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const updatedReview = await prisma.groceryProductReview.update({
        where: { id_storeId: { id, storeId } },
        data: parseResult.data,
      });

      logger.info("[GROCERY_REVIEW_UPDATE]", {
        reviewId: id,
        updatedFields: Object.keys(parseResult.data),
      });

      return NextResponse.json(
        { data: updatedReview },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: reviewId } = await params;
      logger.error("[GROCERY_REVIEW_UPDATE]", { error, reviewId });
      return NextResponse.json(
        { error: "Failed to update review" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.REVIEWS_MANAGE,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      await prisma.groceryProductReview.delete({
        where: { id_storeId: { id, storeId } },
      });

      logger.info("[GROCERY_REVIEW_DELETE]", { reviewId: id });

      return NextResponse.json(
        { message: "Review deleted successfully" },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: reviewId } = await params;
      logger.error("[GROCERY_REVIEW_DELETE]", { error, reviewId });
      return NextResponse.json(
        { error: "Failed to delete review" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
