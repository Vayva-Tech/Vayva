import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_VIEW,
  async (req, { storeId, db, params }) => {
    try {
      const { id } = await params;
      
      const lookbook = await db.lookbook.findUnique({
        where: { id, storeId },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  images: true,
                  sku: true,
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
      
      return NextResponse.json({
        success: true,
        data: lookbook,
      });
    } catch (error: any) {
      logger.error("[FASHION_LOOKBOOK_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOOKBOOK_FETCH_FAILED",
            message: "Failed to fetch lookbook",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      // Check if lookbook exists
      const existingLookbook = await db.lookbook.findUnique({
        where: { id, storeId },
      });
      
      if (!existingLookbook) {
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
      
      // Update lookbook
      const updatedLookbook = await db.lookbook.update({
        where: { id },
        data: {
          ...body,
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
      
      logger.info("[FASHION_LOOKBOOK_UPDATED]", {
        lookbookId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedLookbook,
      });
    } catch (error: any) {
      logger.error("[FASHION_LOOKBOOK_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOOKBOOK_UPDATE_FAILED",
            message: "Failed to update lookbook",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      
      // Check if lookbook exists
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
      
      // Delete lookbook (cascade will handle related records)
      await db.lookbook.delete({
        where: { id },
      });
      
      logger.info("[FASHION_LOOKBOOK_DELETED]", {
        lookbookId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        message: "Lookbook deleted successfully",
      });
    } catch (error: any) {
      logger.error("[FASHION_LOOKBOOK_DELETE]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOOKBOOK_DELETE_FAILED",
            message: "Failed to delete lookbook",
          },
        },
        { status: 500 }
      );
    }
  }
);