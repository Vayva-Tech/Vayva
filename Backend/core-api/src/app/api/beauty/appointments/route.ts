/**
 * Beauty Appointments API Routes
 * GET /api/beauty/appointments - List appointments
 * POST /api/beauty/appointments - Create appointment
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Appointments
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // scheduled, confirmed, completed, cancelled, no_show
      const clientId = searchParams.get("clientId");
      const stylistId = searchParams.get("stylistId");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const appointments = await prisma.beautyAppointment.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(clientId ? { clientId } : {}),
          ...(stylistId ? { stylistId } : {}),
          ...(dateFrom || dateTo ? {
            scheduledAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
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
            }
          }
        },
        orderBy: { scheduledAt: "asc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.beautyAppointment.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(clientId ? { clientId } : {}),
          ...(stylistId ? { stylistId } : {}),
          ...(dateFrom || dateTo ? {
            scheduledAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
      });

      // Add calculated fields
      const appointmentsWithCalcs = appointments.map(appt => ({
        ...appt,
        clientName: `${appt.client.firstName} ${appt.client.lastName}`,
        stylistName: appt.stylist?.name || "Any Stylist",
        serviceName: appt.service.name,
        serviceCategory: appt.service.category,
        isOverdue: appt.status === "scheduled" && appt.scheduledAt < new Date(),
        isToday: appt.scheduledAt.toDateString() === new Date().toDateString(),
        waitTimeMinutes: appt.checkInTime 
          ? Math.floor((appt.checkInTime.getTime() - appt.scheduledAt.getTime()) / 60000)
          : null,
        durationActual: appt.startTime && appt.endTime
          ? Math.floor((appt.endTime.getTime() - appt.startTime.getTime()) / 60000)
          : null,
        isLate: appt.checkInTime && appt.checkInTime > appt.scheduledAt,
        clientIsVip: appt.client.status === "vip",
      }));

      // Summary statistics
      const stats = {
        totalAppointments: appointments.length,
        byStatus: {
          scheduled: appointments.filter(a => a.status === "scheduled").length,
          confirmed: appointments.filter(a => a.status === "confirmed").length,
          completed: appointments.filter(a => a.status === "completed").length,
          cancelled: appointments.filter(a => a.status === "cancelled").length,
          no_show: appointments.filter(a => a.status === "no_show").length,
        },
        byCategory: {
          hair: appointments.filter(a => a.service.category === "hair").length,
          nails: appointments.filter(a => a.service.category === "nails").length,
          skincare: appointments.filter(a => a.service.category === "skincare").length,
          makeup: appointments.filter(a => a.service.category === "makeup").length,
          massage: appointments.filter(a => a.service.category === "massage").length,
        },
        totalRevenue: appointments
          .filter(a => a.status === "completed")
          .reduce((sum, a) => sum + a.price, 0),
        avgAppointmentValue: appointments.length > 0 
          ? Math.round(appointments.reduce((sum, a) => sum + a.price, 0) / appointments.length)
          : 0,
      };

      return NextResponse.json({
        success: true,
        data: appointmentsWithCalcs,
        meta: { total, limit, offset, stats },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_APPOINTMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Appointment
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        clientId,
        stylistId,
        serviceId,
        scheduledAt,
        notes,
      } = body;

      // Validation
      if (!clientId || !serviceId || !scheduledAt) {
        return NextResponse.json(
          { error: "Client ID, service ID, and scheduled time are required" },
          { status: 400 }
        );
      }

      // Verify entities exist
      const [client, service, stylist] = await Promise.all([
        prisma.beautyClient.findFirst({ where: { id: clientId, merchantId: storeId } }),
        prisma.beautyService.findFirst({ where: { id: serviceId, merchantId: storeId, isActive: true } }),
        stylistId 
          ? prisma.user.findFirst({
              where: { 
                id: stylistId,
                storeMemberships: {
                  some: { storeId, role: { in: ["STYLIST", "ADMIN", "OWNER"] } }
                }
              }
            })
          : Promise.resolve(null)
      ]);

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      if (!service) {
        return NextResponse.json(
          { error: "Service not found or inactive" },
          { status: 404 }
        );
      }

      if (stylistId && !stylist) {
        return NextResponse.json(
          { error: "Stylist not found or unauthorized" },
          { status: 404 }
        );
      }

      // Check for scheduling conflicts
      const scheduledDateTime = new Date(scheduledAt);
      const endTime = new Date(scheduledDateTime.getTime() + service.duration * 60000);

      const conflictingAppointments = await prisma.beautyAppointment.findMany({
        where: {
          merchantId: storeId,
          stylistId: stylistId || undefined,
          status: { notIn: ["cancelled", "no_show"] },
          scheduledAt: { lt: endTime },
          OR: [
            { scheduledAt: { gte: scheduledDateTime } },
            { 
              scheduledAt: { lt: scheduledDateTime },
              duration: { gte: (endTime.getTime() - scheduledDateTime.getTime()) / 60000 }
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

      // Create appointment
      const appointment = await prisma.beautyAppointment.create({
        data: {
          merchantId: storeId,
          clientId,
          stylistId: stylist?.id || null,
          serviceId,
          status: "scheduled",
          scheduledAt: scheduledDateTime,
          duration: service.duration,
          price: service.price,
          notes,
        },
      });

      // Update client's next appointment
      await prisma.beautyClient.update({
        where: { id: clientId },
        data: { 
          nextAppointment: scheduledDateTime,
          lastVisit: scheduledDateTime < new Date() ? scheduledDateTime : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...appointment,
          clientName: `${client.firstName} ${client.lastName}`,
          stylistName: stylist?.name || "Any Stylist",
          serviceName: service.name,
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_APPOINTMENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);