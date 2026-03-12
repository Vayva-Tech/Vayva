/**
 * Individual Beauty Appointment API Routes
 * GET /api/beauty/appointments/[id] - Get appointment details
 * PUT /api/beauty/appointments/[id] - Update appointment
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Appointment by ID
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: appointmentId } = await params;
      
      if (!appointmentId) {
        return NextResponse.json(
          { error: "Appointment ID required" },
          { status: 400 }
        );
      }

      const appointment = await prisma.beautyAppointment.findFirst({
        where: {
          id: appointmentId,
          merchantId: storeId,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              skinType: true,
              hairType: true,
              allergies: true,
              preferredServices: true,
              status: true,
            }
          },
          stylist: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              duration: true,
              price: true,
              description: true,
            }
          }
        },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Get related treatments
      const treatments = await prisma.beautyTreatment.findMany({
        where: {
          appointmentId,
          merchantId: storeId,
        },
        include: {
          stylist: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { treatmentDate: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...appointment,
          clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
          stylistName: appointment.stylist?.name || "Any Stylist",
          serviceName: appointment.service.name,
          serviceCategory: appointment.service.category,
          isPast: appointment.scheduledAt < new Date(),
          isToday: appointment.scheduledAt.toDateString() === new Date().toDateString(),
          clientAlerts: [
            ...(appointment.client.allergies.length > 0 ? ["ALLERGIES_PRESENT"] : []),
            ...(appointment.client.preferredServices.includes(appointment.service.name) ? ["PREFERRED_SERVICE"] : []),
            ...(appointment.client.status === "vip" ? ["VIP_CLIENT"] : []),
          ],
          relatedTreatments: treatments.map(treatment => ({
            ...treatment,
            stylistName: treatment.stylist?.name || "Any Stylist",
          })),
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_APPOINTMENT_GET]", error, { storeId, appointmentId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Appointment
export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: appointmentId } = await params;
      
      if (!appointmentId) {
        return NextResponse.json(
          { error: "Appointment ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        scheduledAt,
        duration,
        status,
        stylistId,
        notes,
        startTime,
        endTime,
      } = body;

      // Verify appointment exists
      const existingAppointment = await prisma.beautyAppointment.findFirst({
        where: {
          id: appointmentId,
          merchantId: storeId,
        },
      });

      if (!existingAppointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Check for conflicts if rescheduling
      if (scheduledAt || duration) {
        const service = await prisma.beautyService.findFirst({
          where: { id: existingAppointment.serviceId, merchantId: storeId },
        });

        if (service) {
          const newScheduledAt = scheduledAt ? new Date(scheduledAt) : existingAppointment.scheduledAt;
          const newDuration = duration || existingAppointment.duration;
          const newEndTime = new Date(newScheduledAt.getTime() + newDuration * 60000);

          const conflictingAppointments = await prisma.beautyAppointment.findMany({
            where: {
              merchantId: storeId,
              stylistId: existingAppointment.stylistId || undefined,
              id: { not: appointmentId },
              status: { notIn: ["cancelled", "no_show"] },
              scheduledAt: { lt: newEndTime },
              OR: [
                { scheduledAt: { gte: newScheduledAt } },
                { 
                  scheduledAt: { lt: newScheduledAt },
                  duration: { gte: (newEndTime.getTime() - newScheduledAt.getTime()) / 60000 }
                }
              ]
            },
          });

          if (conflictingAppointments.length > 0) {
            return NextResponse.json(
              { error: "Scheduling conflict detected" },
              { status: 409 }
            );
          }
        }
      }

      const updateData: any = {
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
        ...(duration !== undefined && { duration }),
        ...(status !== undefined && { status }),
        ...(stylistId !== undefined && { stylistId }),
        ...(notes !== undefined && { notes }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        updatedAt: new Date(),
      };

      // Handle status transitions
      if (status === "completed" && !existingAppointment.endTime) {
        updateData.endTime = new Date();
        if (!existingAppointment.startTime) {
          updateData.startTime = new Date();
        }
      } else if (status === "cancelled") {
        updateData.cancelledAt = new Date();
      }

      const updatedAppointment = await prisma.beautyAppointment.update({
        where: { id: appointmentId },
        data: updateData,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          stylist: {
            select: {
              id: true,
              name: true,
            }
          },
          service: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      // Update client metrics if completed
      if (status === "completed") {
        await prisma.beautyClient.update({
          where: { id: updatedAppointment.clientId },
          data: {
            visitCount: { increment: 1 },
            totalSpent: { increment: updatedAppointment.price },
            lastVisit: new Date(),
            nextAppointment: null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...updatedAppointment,
          clientName: `${updatedAppointment.client.firstName} ${updatedAppointment.client.lastName}`,
          stylistName: updatedAppointment.stylist?.name || "Any Stylist",
          serviceName: updatedAppointment.service.name,
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_APPOINTMENT_PUT]", error, { storeId, appointmentId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);