import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const UpdateStoreSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerId: z.string().optional(),
  openingHours: z.record(z.string()).optional(),
  squareFootage: z.number().int().positive().optional(),
  staffCount: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_STORES_VIEW,
  async (req, { params, storeId, db }) => {
    try {
      const { id } = params;
      
      const retailStore = await db.retailStore.findUnique({
        where: { id, storeId },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventoryItems: true,
              transfersFrom: true,
              transfersTo: true,
            },
          },
        },
      });
      
      if (!retailStore) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "STORE_NOT_FOUND",
              message: "Store not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: retailStore,
      });
    } catch (error: any) {
      logger.error("[RETAIL_STORE_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STORE_FETCH_FAILED",
            message: "Failed to fetch store",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RETAIL_STORES_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const validatedData = UpdateStoreSchema.parse(body);
      
      const retailStore = await db.retailStore.findUnique({
        where: { id, storeId },
      });
      
      if (!retailStore) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "STORE_NOT_FOUND",
              message: "Store not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedStore = await db.retailStore.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
        },
        include: {
          manager: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              inventoryItems: true,
            },
          },
        },
      });
      
      logger.info("[RETAIL_STORE_UPDATED]", {
        storeId: id,
        userId: user.id,
        changes: Object.keys(validatedData),
      });
      
      return NextResponse.json({
        success: true,
        data: updatedStore,
        message: "Store updated successfully",
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
      
      logger.error("[RETAIL_STORE_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STORE_UPDATE_FAILED",
            message: "Failed to update store",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.RETAIL_STORES_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      
      const retailStore = await db.retailStore.findUnique({
        where: { id, storeId },
      });
      
      if (!retailStore) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "STORE_NOT_FOUND",
              message: "Store not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Check if store has inventory or active transfers
      const hasActiveData = await db.$transaction([
        db.inventoryItem.count({ where: { storeId: id } }),
        db.inventoryTransfer.count({
          where: {
            OR: [
              { fromStoreId: id },
              { toStoreId: id },
            ],
          },
        }),
      ]);
      
      if (hasActiveData.some(count => count > 0)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "STORE_DELETE_RESTRICTED",
              message: "Cannot delete store with active inventory or transfers",
            },
          },
          { status: 400 }
        );
      }
      
      await db.retailStore.delete({
        where: { id },
      });
      
      logger.info("[RETAIL_STORE_DELETED]", {
        storeId: id,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        message: "Store deleted successfully",
      });
    } catch (error: any) {
      logger.error("[RETAIL_STORE_DELETE]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STORE_DELETE_FAILED",
            message: "Failed to delete store",
          },
        },
        { status: 500 }
      );
    }
  }
);