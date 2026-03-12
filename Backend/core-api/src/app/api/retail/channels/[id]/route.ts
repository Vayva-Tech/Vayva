import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const UpdateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  credentials: z.record(z.any()).optional(),
  syncSettings: z.record(z.any()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_CHANNELS_VIEW,
  async (req, { params, storeId, db }) => {
    try {
      const { id } = params;
      
      const channel = await db.salesChannel.findUnique({
        where: { id, storeId },
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      });
      
      if (!channel) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CHANNEL_NOT_FOUND",
              message: "Sales channel not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: channel,
      });
    } catch (error: any) {
      logger.error("[RETAIL_CHANNEL_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHANNEL_FETCH_FAILED",
            message: "Failed to fetch sales channel",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RETAIL_CHANNELS_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const validatedData = UpdateChannelSchema.parse(body);
      
      const channel = await db.salesChannel.findUnique({
        where: { id, storeId },
      });
      
      if (!channel) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CHANNEL_NOT_FOUND",
              message: "Sales channel not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedChannel = await db.salesChannel.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      });
      
      logger.info("[RETAIL_CHANNEL_UPDATED]", {
        channelId: id,
        storeId,
        userId: user.id,
        changes: Object.keys(validatedData),
      });
      
      return NextResponse.json({
        success: true,
        data: updatedChannel,
        message: "Sales channel updated successfully",
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
      
      logger.error("[RETAIL_CHANNEL_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHANNEL_UPDATE_FAILED",
            message: "Failed to update sales channel",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.RETAIL_CHANNELS_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      
      const channel = await db.salesChannel.findUnique({
        where: { id, storeId },
      });
      
      if (!channel) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CHANNEL_NOT_FOUND",
              message: "Sales channel not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Check if channel has active products/orders
      const hasActiveData = await db.$transaction([
        db.channelProduct.count({ where: { channelId: id } }),
        db.order.count({ where: { channelId: id } }),
      ]);
      
      if (hasActiveData.some(count => count > 0)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CHANNEL_DELETE_RESTRICTED",
              message: "Cannot delete channel with active products or orders",
            },
          },
          { status: 400 }
        );
      }
      
      await db.salesChannel.delete({
        where: { id },
      });
      
      logger.info("[RETAIL_CHANNEL_DELETED]", {
        channelId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        message: "Sales channel deleted successfully",
      });
    } catch (error: any) {
      logger.error("[RETAIL_CHANNEL_DELETE]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHANNEL_DELETE_FAILED",
            message: "Failed to delete sales channel",
          },
        },
        { status: 500 }
      );
    }
  }
);