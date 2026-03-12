import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

const appointmentSchema = z.object({
  serviceId: z.string(),
  stylistId: z.string().optional(),
  customerId: z.string(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/appointments
 * Returns list of appointments with filtering options
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const stylistId = searchParams.get("stylistId");
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where: any = { storeId };

      if (startDate && endDate) {
        where.startsAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (stylistId) {
        where.stylistId = stylistId;
      }

      if (status) {
        where.status = status;
      }

      const appointments = await prisma.booking?.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              price: true,
              duration: true,
            },
          },
          stylist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          startsAt: "desc",
        },
        take: limit,
      }) || [];

      return NextResponse.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      logger.error("[BEAUTY_APPOINTMENTS_GET] Error fetching appointments", { storeId, error });
      return NextResponse.json(
        { error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/beauty/appointments
 * Create a new appointment
 */
export const POST = withVayvaAPI(
  PERMISSIONS.BOOKING_CREATE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const validatedData = appointmentSchema.parse(body);

      const appointment = await prisma.booking?.create({
        data: {
          ...validatedData,
          storeId,
          status: "PENDING",
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              price: true,
            },
          },
        },
      });

      logger.info("[BEAUTY_APPOINTMENTS_POST] Appointment created", { 
        appointmentId: appointment?.id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_APPOINTMENTS_POST] Error creating appointment", { storeId, error });
      return NextResponse.json(
        { error: "Failed to create appointment" },
        { status: 500 }
      );
    }
  }
);
