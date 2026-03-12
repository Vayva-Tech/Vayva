/**
 * Individual Beauty Client API Routes
 * GET /api/beauty/clients/[id] - Get client details
 * PUT /api/beauty/clients/[id] - Update client
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Client by ID
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: clientId } = await params;
      
      if (!clientId) {
        return NextResponse.json(
          { error: "Client ID required" },
          { status: 400 }
        );
      }

      const client = await prisma.beautyClient.findFirst({
        where: {
          id: clientId,
          merchantId: storeId,
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      // Get client history
      const [appointments, treatments, productSales] = await Promise.all([
        prisma.beautyAppointment.findMany({
          where: { clientId, merchantId: storeId },
          include: {
            service: { select: { name: true, category: true } },
            stylist: { select: { name: true } },
          },
          orderBy: { scheduledAt: "desc" },
          take: 10,
        }),
        prisma.beautyTreatment.findMany({
          where: { clientId, merchantId: storeId },
          include: {
            service: { select: { name: true } },
            stylist: { select: { name: true } },
          },
          orderBy: { treatmentDate: "desc" },
          take: 10,
        }),
        prisma.beautyProductSale.findMany({
          where: { clientId, merchantId: storeId },
          include: {
            product: { select: { name: true, brand: true } },
          },
          orderBy: { soldAt: "desc" },
          take: 10,
        }),
      ]);

      // Calculate loyalty metrics
      const totalVisits = client.visitCount;
      const totalSpent = client.totalSpent;
      const avgSpendPerVisit = totalVisits > 0 ? totalSpent / totalVisits : 0;
      const daysSinceLastVisit = client.lastVisit 
        ? Math.floor((Date.now() - client.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      // Loyalty tier calculation
      let loyaltyTier = "New";
      if (totalVisits >= 20) loyaltyTier = "Platinum";
      else if (totalVisits >= 10) loyaltyTier = "Gold";
      else if (totalVisits >= 5) loyaltyTier = "Silver";

      return NextResponse.json({
        success: true,
        data: {
          ...client,
          fullName: `${client.firstName} ${client.lastName}`,
          appointments: appointments.map(appt => ({
            ...appt,
            serviceName: appt.service.name,
            serviceCategory: appt.service.category,
            stylistName: appt.stylist?.name || "Any Stylist",
          })),
          treatments: treatments.map(treatment => ({
            ...treatment,
            serviceName: treatment.service.name,
            stylistName: treatment.stylist?.name || "Any Stylist",
          })),
          productPurchases: productSales.map(sale => ({
            ...sale,
            productName: sale.product.name,
            brand: sale.product.brand,
          })),
          metrics: {
            totalVisits,
            totalSpent,
            avgSpendPerVisit: Math.round(avgSpendPerVisit),
            daysSinceLastVisit,
            loyaltyTier,
            isVip: client.status === "vip",
            isBirthdayThisMonth: client.birthday 
              ? client.birthday.getMonth() === new Date().getMonth()
              : false,
          },
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_CLIENT_GET]", error, { storeId, clientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Client
export const PUT = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: clientId } = await params;
      
      if (!clientId) {
        return NextResponse.json(
          { error: "Client ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        firstName,
        lastName,
        phone,
        email,
        birthday,
        address,
        skinType,
        hairType,
        allergies,
        preferredServices,
        notes,
        referredBy,
        marketingConsent,
        status,
      } = body;

      // Verify client exists
      const existingClient = await prisma.beautyClient.findFirst({
        where: {
          id: clientId,
          merchantId: storeId,
        },
      });

      if (!existingClient) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      const updatedClient = await prisma.beautyClient.update({
        where: { id: clientId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
          ...(address !== undefined && { address: address ? JSON.stringify(address) : null }),
          ...(skinType !== undefined && { skinType }),
          ...(hairType !== undefined && { hairType }),
          ...(allergies !== undefined && { allergies }),
          ...(preferredServices !== undefined && { preferredServices }),
          ...(notes !== undefined && { notes }),
          ...(referredBy !== undefined && { referredBy }),
          ...(marketingConsent !== undefined && { marketingConsent }),
          ...(status !== undefined && { status }),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedClient,
          fullName: `${updatedClient.firstName} ${updatedClient.lastName}`,
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_CLIENT_PUT]", error, { storeId, clientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);