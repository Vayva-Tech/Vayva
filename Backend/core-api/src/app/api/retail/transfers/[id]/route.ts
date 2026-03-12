import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const TransferActionSchema = z.object({
  action: z.enum(["approve", "reject", "cancel"]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_TRANSFERS_VIEW,
  async (req, { params, storeId, db }) => {
    try {
      const { id } = params;
      
      const transfer = await db.inventoryTransfer.findUnique({
        where: { id, storeId },
        include: {
          fromStore: {
            select: {
              id: true,
              name: true,
            },
          },
          toStore: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      
      if (!transfer) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TRANSFER_NOT_FOUND",
              message: "Transfer not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: transfer,
      });
    } catch (error: any) {
      logger.error("[RETAIL_TRANSFER_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TRANSFER_FETCH_FAILED",
            message: "Failed to fetch transfer",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RETAIL_TRANSFERS_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const validatedData = TransferActionSchema.parse(body);
      
      const transfer = await db.inventoryTransfer.findUnique({
        where: { id, storeId },
      });
      
      if (!transfer) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TRANSFER_NOT_FOUND",
              message: "Transfer not found",
            },
          },
          { status: 404 }
        );
      }
      
      if (transfer.status !== "PENDING") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TRANSFER_ACTION_INVALID",
              message: `Cannot ${validatedData.action} transfer with status ${transfer.status}`,
            },
          },
          { status: 400 }
        );
      }
      
      let newStatus: string;
      switch (validatedData.action) {
        case "approve":
          newStatus = "APPROVED";
          break;
        case "reject":
          newStatus = "REJECTED";
          break;
        case "cancel":
          newStatus = "CANCELLED";
          break;
        default:
          newStatus = transfer.status;
      }
      
      const updatedTransfer = await db.inventoryTransfer.update({
        where: { id },
        data: {
          status: newStatus,
          approvedById: validatedData.action === "approve" ? user.id : undefined,
          approvalNotes: validatedData.notes,
          approvedAt: validatedData.action === "approve" ? new Date() : undefined,
        },
        include: {
          fromStore: {
            select: {
              name: true,
            },
          },
          toStore: {
            select: {
              name: true,
            },
          },
        },
      });
      
      logger.info("[RETAIL_TRANSFER_UPDATED]", {
        transferId: id,
        action: validatedData.action,
        newStatus,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedTransfer,
        message: `Transfer ${validatedData.action}d successfully`,
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
      
      logger.error("[RETAIL_TRANSFER_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TRANSFER_UPDATE_FAILED",
            message: "Failed to update transfer",
          },
        },
        { status: 500 }
      );
    }
  }
);