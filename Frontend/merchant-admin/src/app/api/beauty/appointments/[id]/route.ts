import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

const updateAppointmentSchema = z.object({
  serviceId: z.string().optional(),
  stylistId: z.string().optional(),
  customerId: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/appointments/[id]
 * Get specific appointment details
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const appointment = await prisma.booking?.findUnique({
        where: {
          id,
          storeId,
        },
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
              description: true,
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
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      logger.error("[BEAUTY_APPOINTMENT_ID_GET] Error fetching appointment", { storeId, error });
      return NextResponse.json(
        { error: "Failed to fetch appointment" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/beauty/appointments/[id]
 * Update an existing appointment
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.BOOKING_UPDATE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = updateAppointmentSchema.parse(body);

      // Verify appointment exists and belongs to store
      const existingAppointment = await prisma.booking?.findUnique({
        where: { id, storeId },
      });

      if (!existingAppointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      const updatedAppointment = await prisma.booking?.update({
        where: { id },
        data: validatedData,
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

      logger.info("[BEAUTY_APPOINTMENT_ID_PUT] Appointment updated", { 
        appointmentId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: updatedAppointment,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_APPOINTMENT_ID_PUT] Error updating appointment", { storeId, error });
      return NextResponse.json(
        { error: "Failed to update appointment" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/beauty/appointments/[id]
 * Cancel or delete an appointment
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.BOOKING_DELETE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      // Verify appointment exists and belongs to store
      const existingAppointment = await prisma.booking?.findUnique({
        where: { id, storeId },
      });

      if (!existingAppointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Soft delete by setting status to CANCELLED
      await prisma.booking?.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      logger.info("[BEAUTY_APPOINTMENT_ID_DELETE] Appointment cancelled", { 
        appointmentId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        message: "Appointment cancelled successfully",
      });
    } catch (error) {
      logger.error("[BEAUTY_APPOINTMENT_ID_DELETE] Error cancelling appointment", { storeId, error });
      return NextResponse.json(
        { error: "Failed to cancel appointment" },
        { status: 500 }
      );
    }
  }
);
