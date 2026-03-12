/**
 * Real Estate Leads API Routes
 * POST /api/realestate/leads - Create lead
 * GET /api/realestate/leads - List leads
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Create Lead
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        firstName,
        lastName,
        email,
        phone,
        type,
        source,
        budgetMin,
        budgetMax,
        preferredLocations,
        propertyTypes,
        bedrooms,
        bathrooms,
        timeline,
        preApproved,
        preApprovalAmount,
        notes,
        tags,
      } = body;

      if (!firstName || !lastName || !email) {
        return NextResponse.json(
          { error: "First name, last name, and email are required" },
          { status: 400 }
        );
      }

      const lead = await prisma.realEstateLead.create({
        data: {
          merchantId: storeId,
          agentId: user.id,
          firstName,
          lastName,
          email,
          phone,
          type: type || "buyer",
          status: "new",
          source: source || "website",
          budgetMin,
          budgetMax,
          preferredLocations: preferredLocations || [],
          propertyTypes: propertyTypes || [],
          bedrooms,
          bathrooms,
          timeline,
          preApproved: preApproved || false,
          preApprovalAmount,
          notes,
          tags: tags || [],
        },
      });

      return NextResponse.json({
        success: true,
        data: lead,
      });
    } catch (error: unknown) {
      logger.error("[LEAD_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET List Leads
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const type = searchParams.get("type");
      const agentId = searchParams.get("agentId");

      const leads = await prisma.realEstateLead.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(agentId ? { agentId } : {}),
        },
        include: {
          scores: {
            orderBy: { calculatedAt: "desc" },
            take: 1,
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.realEstateLead.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(agentId ? { agentId } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: leads,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[LEAD_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
