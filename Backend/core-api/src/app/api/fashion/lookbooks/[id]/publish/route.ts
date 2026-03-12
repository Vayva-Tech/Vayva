import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const PublishSchema = z.object({
  publishAt: z.string().datetime().optional(),
});

export const POST = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = PublishSchema.parse(body);
      
      // Check if lookbook exists and belongs to store
      const lookbook = await db.lookbook.findUnique({
        where: { id, storeId },
      });
      
      if (!lookbook) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "LOOKBOOK_NOT_FOUND",
              message: "Lookbook not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Update lookbook status
      const updatedLookbook = await db.lookbook.update({
        where: { id },
        data: {
          isActive: true,
          publishedAt: validatedData.publishAt ? new Date(validatedData.publishAt) : new Date(),
          updatedBy: user.id,
        },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      });
      
      logger.info("[FASHION_LOOKBOOK_PUBLISHED]", {
        lookbookId: id,
        storeId,
        userId: user.id,
        publishAt: validatedData.publishAt,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedLookbook,
        message: "Lookbook published successfully",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[FASHION_LOOKBOOK_PUBLISH]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOOKBOOK_PUBLISH_FAILED",
            message: "Failed to publish lookbook",
          },
        },
        { status: 500 }
      );
    }
  }
);