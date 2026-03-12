import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

const stylistSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["STYLIST", "SENIOR_STYLIST", "JUNIOR_STYLIST", "NAIL_TECH"]),
  specialty: z.string().optional(),
  commissionRate: z.number().optional(),
  maxAppointmentsPerDay: z.number().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/stylists
 * Returns list of stylists with filtering options
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const role = searchParams.get("role");
      const availableOnly = searchParams.get("availableOnly") === "true";
      const limit = parseInt(searchParams.get("limit") || "50");

      const where: any = {
        storeId,
        role: {
          in: ["STYLIST", "SENIOR_STYLIST", "JUNIOR_STYLIST", "NAIL_TECH"],
        },
      };

      if (role) {
        where.role = role;
      }

      const stylists = await prisma.user?.findMany({
        where,
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
            take: 5,
            include: {
              service: {
                select: {
                  title: true,
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
        orderBy: {
          firstName: "asc",
        },
        take: limit,
      }) || [];

      // Calculate availability and performance metrics
      const stylistsWithMetrics = stylists.map((stylist) => {
        const nextAppointment = stylist.bookings?.[0];
        const isAvailable = !nextAppointment || new Date(nextAppointment.startsAt).getTime() > Date.now() + 30 * 60 * 1000;
        
        return {
          ...stylist,
          isAvailable,
          nextAppointment,
          totalBookings: stylist.bookings?.length || 0,
        };
      });

      return NextResponse.json({
        success: true,
        data: stylistsWithMetrics,
      });
    } catch (error) {
      logger.error("[BEAUTY_STYLISTS_GET] Error fetching stylists", { storeId, error });
      return NextResponse.json(
        { error: "Failed to fetch stylists" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/beauty/stylists
 * Create a new stylist
 */
export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const validatedData = stylistSchema.parse(body);

      // Check if email already exists in store
      const existingUser = await prisma.user?.findFirst({
        where: {
          email: validatedData.email,
          storeId,
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      const stylist = await prisma.user?.create({
        data: {
          ...validatedData,
          storeId,
          password: "", // Will need to set password separately
        },
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

      logger.info("[BEAUTY_STYLISTS_POST] Stylist created", { 
        stylistId: stylist?.id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: stylist,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_STYLISTS_POST] Error creating stylist", { storeId, error });
      return NextResponse.json(
        { error: "Failed to create stylist" },
        { status: 500 }
      );
    }
  }
);
