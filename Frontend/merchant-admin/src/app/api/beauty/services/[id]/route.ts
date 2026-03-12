import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

/**
 * GET /api/beauty/services/[id]
 * Get specific service details
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const service = await prisma.service.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
        include: {
          bookings: {
            select: {
              id: true,
              startsAt: true,
              status: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              startsAt: "desc",
            },
            take: 10,
          },
        },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Calculate performance metrics
      const totalBookings = await prisma.booking.count({
        where: {
          serviceId: id,
          merchantId: storeId,
        },
      });

      const revenueThisMonth = await prisma.booking.aggregate({
        where: {
          serviceId: id,
          merchantId: storeId,
          status: "COMPLETED",
          startsAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
        _sum: {
          totalPrice: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...service,
          performance: {
            totalBookings,
            revenueThisMonth: revenueThisMonth._sum.totalPrice || 0,
          },
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICE_ID_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch service" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/beauty/services/[id]
 * Update an existing service
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const {
        name,
        description,
        category,
        duration,
        price,
        imageUrl,
        status,
        metadata,
      } = body;

      // Verify service exists and belongs to store
      const existingService = await prisma.service.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!existingService) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(duration !== undefined && { duration }),
          ...(price !== undefined && { price }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(status !== undefined && { status }),
          ...(metadata !== undefined && { 
            metadata: typeof metadata === "string" ? metadata : JSON.stringify(metadata) 
          }),
        },
      });

      logger.info("[BEAUTY_SERVICE_ID_PUT] Service updated", { 
        serviceId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: updatedService,
        message: "Service updated successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICE_ID_PUT_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to update service" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/beauty/services/[id]
 * Delete a service (soft delete by setting status to inactive)
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      // Verify service exists and belongs to store
      const existingService = await prisma.service.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!existingService) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Check if service has upcoming bookings
      const upcomingBookings = await prisma.booking.count({
        where: {
          serviceId: id,
          startsAt: {
            gte: new Date(),
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      });

      if (upcomingBookings > 0) {
        return NextResponse.json(
          { error: `Cannot delete service with ${upcomingBookings} upcoming bookings` },
          { status: 400 }
        );
      }

      // Soft delete by setting status to inactive
      await prisma.service.update({
        where: { id },
        data: {
          status: "inactive",
        },
      });

      logger.info("[BEAUTY_SERVICE_ID_DELETE] Service deleted", { 
        serviceId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICE_ID_DELETE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to delete service" },
        { status: 500 }
      );
    }
  }
);
