import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/showings/[id] - Get specific showing
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const showing = await prisma.propertyShowing.findUnique({
        where: { id, merchantId: storeId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              price: true,
              bedrooms: true,
              bathrooms: true,
              area: true,
              images: true
            }
          },
          feedback: true
        }
      });

      if (!showing) {
        return NextResponse.json(
          { success: false, error: "Showing not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: showing
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch showing" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/realestate/showings/[id] - Update showing
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const existingShowing = await prisma.propertyShowing.findUnique({
        where: { id, merchantId: storeId }
      });

      if (!existingShowing) {
        return NextResponse.json(
          { success: false, error: "Showing not found" },
          { status: 404 }
        );
      }

      // Calculate end time if duration or scheduledAt changed
      let endTime = existingShowing.endTime;
      if (body.duration || body.scheduledAt) {
        const startTime = body.scheduledAt ? new Date(body.scheduledAt) : new Date(existingShowing.scheduledAt);
        const duration = body.duration || existingShowing.duration;
        endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      }

      const updatedShowing = await prisma.propertyShowing.update({
        where: { id, merchantId: storeId },
        data: {
          ...body,
          endTime,
          updatedAt: new Date()
        },
        include: {
          property: true,
          feedback: true
        }
      });

      return NextResponse.json({
        success: true,
        data: updatedShowing,
        message: "Showing updated successfully"
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_UPDATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to update showing" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/realestate/showings/[id] - Delete/cancel showing
export const DELETE = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const showing = await prisma.propertyShowing.findUnique({
        where: { id, merchantId: storeId }
      });

      if (!showing) {
        return NextResponse.json(
          { success: false, error: "Showing not found" },
          { status: 404 }
        );
      }

      // Soft delete by marking as cancelled
      await prisma.propertyShowing.update({
        where: { id, merchantId: storeId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Showing cancelled successfully"
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_DELETE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to cancel showing" },
        { status: 500 }
      );
    }
  }
);
