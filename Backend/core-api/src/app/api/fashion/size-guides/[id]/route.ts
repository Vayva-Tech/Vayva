import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_SIZE_GUIDES_VIEW,
  async (req, { storeId, db, params }) => {
    try {
      const { id } = await params;
      
      const sizeGuide = await db.sizeGuide.findUnique({
        where: { id, storeId },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      
      if (!sizeGuide) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SIZE_GUIDE_NOT_FOUND",
              message: "Size guide not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: sizeGuide,
      });
    } catch (error: any) {
      logger.error("[FASHION_SIZE_GUIDE_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SIZE_GUIDE_FETCH_FAILED",
            message: "Failed to fetch size guide",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.FASHION_SIZE_GUIDES_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const existingSizeGuide = await db.sizeGuide.findUnique({
        where: { id, storeId },
      });
      
      if (!existingSizeGuide) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SIZE_GUIDE_NOT_FOUND",
              message: "Size guide not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedSizeGuide = await db.sizeGuide.update({
        where: { id },
        data: {
          ...body,
          updatedBy: user.id,
        },
      });
      
      logger.info("[FASHION_SIZE_GUIDE_UPDATED]", {
        sizeGuideId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedSizeGuide,
      });
    } catch (error: any) {
      logger.error("[FASHION_SIZE_GUIDE_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SIZE_GUIDE_UPDATE_FAILED",
            message: "Failed to update size guide",
          },
        },
        { status: 500 }
      );
    }
  }
);