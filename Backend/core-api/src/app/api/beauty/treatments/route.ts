/**
 * Beauty Treatments API Routes
 * GET /api/beauty/treatments - List treatments
 * POST /api/beauty/treatments - Create treatment
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Treatments
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const clientId = searchParams.get("clientId");
      const serviceId = searchParams.get("serviceId");
      const stylistId = searchParams.get("stylistId");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const treatments = await prisma.beautyTreatment.findMany({
        where: {
          merchantId: storeId,
          ...(clientId ? { clientId } : {}),
          ...(serviceId ? { serviceId } : {}),
          ...(stylistId ? { stylistId } : {}),
          ...(dateFrom || dateTo ? {
            treatmentDate: {
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
              status: true,
            }
          },
          appointment: {
            select: {
              id: true,
              scheduledAt: true,
              status: true,
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
            }
          },
          stylist: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { treatmentDate: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.beautyTreatment.count({
        where: {
          merchantId: storeId,
          ...(clientId ? { clientId } : {}),
          ...(serviceId ? { serviceId } : {}),
          ...(stylistId ? { stylistId } : {}),
          ...(dateFrom || dateTo ? {
            treatmentDate: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
      });

      // Add calculated fields
      const treatmentsWithCalcs = treatments.map(treatment => ({
        ...treatment,
        clientName: `${treatment.client.firstName} ${treatment.client.lastName}`,
        serviceName: treatment.service.name,
        serviceCategory: treatment.service.category,
        stylistName: treatment.stylist?.name || "Any Stylist",
        hasPhotos: treatment.beforePhotos.length > 0 || treatment.afterPhotos.length > 0,
        hasNotes: !!treatment.notes,
        isFollowUpNeeded: treatment.followUpNeeded,
        daysSinceTreatment: Math.floor((Date.now() - treatment.treatmentDate.getTime()) / (1000 * 60 * 60 * 24)),
        clientIsVip: treatment.client.status === "vip",
        satisfactionDisplay: treatment.satisfaction 
          ? `${treatment.satisfaction}/5 stars`
          : "Not rated",
      }));

      return NextResponse.json({
        success: true,
        data: treatmentsWithCalcs,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_TREATMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Treatment
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        clientId,
        appointmentId,
        serviceId,
        stylistId,
        notes,
        productsUsed,
        beforePhotos,
        afterPhotos,
        satisfaction,
        followUpNeeded,
        followUpDate,
      } = body;

      // Validation
      if (!clientId || !serviceId) {
        return NextResponse.json(
          { error: "Client ID and service ID are required" },
          { status: 400 }
        );
      }

      // Verify entities exist
      const [client, service, appointment, stylist] = await Promise.all([
        prisma.beautyClient.findFirst({ where: { id: clientId, merchantId: storeId } }),
        prisma.beautyService.findFirst({ where: { id: serviceId, merchantId: storeId } }),
        appointmentId 
          ? prisma.beautyAppointment.findFirst({ 
              where: { id: appointmentId, merchantId: storeId } 
            })
          : Promise.resolve(null),
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
          { error: "Service not found" },
          { status: 404 }
        );
      }

      if (appointmentId && !appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      if (stylistId && !stylist) {
        return NextResponse.json(
          { error: "Stylist not found or unauthorized" },
          { status: 404 }
        );
      }

      const treatment = await prisma.beautyTreatment.create({
        data: {
          merchantId: storeId,
          clientId,
          appointmentId: appointment?.id || null,
          serviceId,
          stylistId: stylist?.id || null,
          treatmentDate: new Date(),
          notes,
          productsUsed: productsUsed || [],
          beforePhotos: beforePhotos || [],
          afterPhotos: afterPhotos || [],
          satisfaction,
          followUpNeeded: followUpNeeded || false,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...treatment,
          clientName: `${client.firstName} ${client.lastName}`,
          serviceName: service.name,
          stylistName: stylist?.name || "Any Stylist",
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_TREATMENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);