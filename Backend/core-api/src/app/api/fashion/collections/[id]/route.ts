import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_COLLECTIONS_VIEW,
  async (req, { storeId, db, params }) => {
    try {
      const { id } = await params;
      
      const collection = await db.collection.findUnique({
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
                  inventory: {
                    select: {
                      quantity: true,
                      reserved: true,
                    },
                  },
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
      
      if (!collection) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "COLLECTION_NOT_FOUND",
              message: "Collection not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: collection,
      });
    } catch (error: any) {
      logger.error("[FASHION_COLLECTION_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COLLECTION_FETCH_FAILED",
            message: "Failed to fetch collection",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.FASHION_COLLECTIONS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const existingCollection = await db.collection.findUnique({
        where: { id, storeId },
      });
      
      if (!existingCollection) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "COLLECTION_NOT_FOUND",
              message: "Collection not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedCollection = await db.collection.update({
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
      
      logger.info("[FASHION_COLLECTION_UPDATED]", {
        collectionId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedCollection,
      });
    } catch (error: any) {
      logger.error("[FASHION_COLLECTION_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COLLECTION_UPDATE_FAILED",
            message: "Failed to update collection",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.FASHION_COLLECTIONS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      
      const collection = await db.collection.findUnique({
        where: { id, storeId },
      });
      
      if (!collection) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "COLLECTION_NOT_FOUND",
              message: "Collection not found",
            },
          },
          { status: 404 }
        );
      }
      
      await db.collection.delete({
        where: { id },
      });
      
      logger.info("[FASHION_COLLECTION_DELETED]", {
        collectionId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        message: "Collection deleted successfully",
      });
    } catch (error: any) {
      logger.error("[FASHION_COLLECTION_DELETE]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COLLECTION_DELETE_FAILED",
            message: "Failed to delete collection",
          },
        },
        { status: 500 }
      );
    }
  }
);