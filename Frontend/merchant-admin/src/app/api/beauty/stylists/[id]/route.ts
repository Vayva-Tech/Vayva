import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

const updateStylistSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["STYLIST", "SENIOR_STYLIST", "JUNIOR_STYLIST", "NAIL_TECH"]).optional(),
  specialty: z.string().optional(),
  commissionRate: z.number().optional(),
  maxAppointmentsPerDay: z.number().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/stylists/[id]
 * Get specific stylist details
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const stylist = await prisma.user?.findUnique({
        where: {
          id,
          storeId,
          role: {
            in: ["STYLIST", "SENIOR_STYLIST", "JUNIOR_STYLIST", "NAIL_TECH"],
          },
        },
        include: {
          bookings: {
            where: {
              startsAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              startsAt: "asc",
            },
            include: {
              service: {
                select: {
                  title: true,
                  price: true,
                  duration: true,
                },
              },
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!stylist) {
        return NextResponse.json(
          { error: "Stylist not found" },
          { status: 404 }
        );
      }

      // Calculate performance metrics
      const completedBookings = await prisma.booking?.count({
        where: {
          stylistId: id,
          status: "COMPLETED",
          startsAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      });

      const revenueThisMonth = await prisma.booking?.aggregate({
        where: {
          stylistId: id,
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
          ...stylist,
          performance: {
            completedBookings: completedBookings || 0,
            revenueThisMonth: revenueThisMonth?._sum.totalPrice || 0,
          },
        },
      });
    } catch (error) {
      logger.error("[BEAUTY_STYLIST_ID_GET] Error fetching stylist", { storeId, error });
      return NextResponse.json(
        { error: "Failed to fetch stylist" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/beauty/stylists/[id]
 * Update an existing stylist
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = updateStylistSchema.parse(body);

      // Verify stylist exists and belongs to store
      const existingStylist = await prisma.user?.findUnique({
        where: { id, storeId },
      });

      if (!existingStylist) {
        return NextResponse.json(
          { error: "Stylist not found" },
          { status: 404 }
        );
      }

      // Check if new email already exists
      if (validatedData.email && validatedData.email !== existingStylist.email) {
        const emailExists = await prisma.user?.findFirst({
          where: {
            email: validatedData.email,
            storeId,
            id: { not: id },
          },
        });

        if (emailExists) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 400 }
          );
        }
      }

      const updatedStylist = await prisma.user?.update({
        where: { id },
        data: validatedData,
        include: {
          bookings: {
            select: {
              id: true,
              startsAt: true,
              status: true,
            },
          },
        },
      });

      logger.info("[BEAUTY_STYLIST_ID_PUT] Stylist updated", { 
        stylistId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: updatedStylist,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_STYLIST_ID_PUT] Error updating stylist", { storeId, error });
      return NextResponse.json(
        { error: "Failed to update stylist" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/beauty/stylists/[id]
 * Deactivate a stylist (soft delete)
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      // Verify stylist exists and belongs to store
      const existingStylist = await prisma.user?.findUnique({
        where: { id, storeId },
      });

      if (!existingStylist) {
        return NextResponse.json(
          { error: "Stylist not found" },
          { status: 404 }
        );
      }

      // Soft delete by changing role to inactive or adding deleted flag
      await prisma.user?.update({
        where: { id },
        data: {
          role: "CUSTOMER", // Demote to customer role
          metadata: {
            ...(existingStylist.metadata as any || {}),
            deletedAt: new Date(),
            previousRole: existingStylist.role,
          },
        },
      });

      logger.info("[BEAUTY_STYLIST_ID_DELETE] Stylist deactivated", { 
        stylistId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        message: "Stylist deactivated successfully",
      });
    } catch (error) {
      logger.error("[BEAUTY_STYLIST_ID_DELETE] Error deactivating stylist", { storeId, error });
      return NextResponse.json(
        { error: "Failed to deactivate stylist" },
        { status: 500 }
      );
    }
  }
);
