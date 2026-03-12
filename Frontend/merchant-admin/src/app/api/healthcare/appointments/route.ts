import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/healthcare/appointments - Get all appointments
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const serviceId = searchParams.get("serviceId");
      const date = searchParams.get("date");

      const where: Record<string, unknown> = {
        storeId,
      };

      if (status) {
        where.status = status;
      }

      if (serviceId) {
        where.serviceId = serviceId;
      }

      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.appointmentDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }

      const [appointments, total] = await Promise.all([
        (prisma as any).healthcareAppointment.findMany({
          where,
          orderBy: { appointmentDate: "asc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).healthcareAppointment.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: appointments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + appointments.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_APPOINTMENTS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }
  }
);

// POST /api/healthcare/appointments - Create a new appointment
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        serviceId,
        patientId,
        providerId,
        scheduledAt,
        startTime,
        endTime,
        notes,
        status = "scheduled",
      } = body;

      if (!patientId || !providerId || !scheduledAt || !startTime || !endTime) {
        return NextResponse.json(
          {
            success: false,
            error: "patientId, providerId, scheduledAt, startTime, and endTime are required",
          },
          { status: 400 }
        );
      }

      const appointment = await (prisma as any).healthcareAppointment.create({
        data: {
          storeId,
          ...(serviceId ? { serviceId } : {}),
          patientId,
          providerId,
          appointmentDate: new Date(scheduledAt),
          startTime,
          endTime,
          notes,
          status,
        },
      });

      logger.info("[HEALTHCARE_APPOINTMENT_CREATED]", { appointmentId: appointment.id, storeId });

      return NextResponse.json({
        success: true,
        data: appointment,
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_APPOINTMENT_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create appointment" },
        { status: 500 }
      );
    }
  }
);
