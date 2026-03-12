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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const review = await prisma.groceryReview.findFirst({
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
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: review },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_REVIEW_GET]", { error, reviewId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = ReviewUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid review data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const updatedReview = await prisma.groceryReview.update({
      where: { id_storeId: { id, storeId } },
      data: parseResult.data,
    });

    logger.info("[GROCERY_REVIEW_UPDATE]", {
      reviewId: id,
      updatedFields: Object.keys(parseResult.data),
    });

    return NextResponse.json(
      { data: updatedReview },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_REVIEW_UPDATE]", { error, reviewId: params.id });
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    await prisma.groceryReview.delete({
      where: { id_storeId: { id, storeId } },
    });

    logger.info("[GROCERY_REVIEW_DELETE]", { reviewId: id });

    return NextResponse.json(
      { message: "Review deleted successfully" },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_REVIEW_DELETE]", { error, reviewId: params.id });
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}