/**
 * Insurance Providers API Routes
 * GET /api/healthcare/insurance/providers - List insurance providers
 * POST /api/healthcare/insurance/providers - Create insurance provider
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Insurance Providers
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const isActive = searchParams.get("isActive"); // true/false
      const type = searchParams.get("type"); // commercial, medicare, medicaid

      const providers = await prisma.insuranceProvider.findMany({
        where: {
          merchantId: storeId,
          ...(isActive !== null ? { isActive: isActive === "true" } : {}),
          ...(type ? { type } : {}),
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.insuranceProvider.count({
        where: {
          merchantId: storeId,
          ...(isActive !== null ? { isActive: isActive === "true" } : {}),
          ...(type ? { type } : {}),
        },
      });

      // Add claim statistics
      const providersWithStats = await Promise.all(providers.map(async (provider) => {
        const claimCount = await prisma.insuranceClaim.count({
          where: {
            merchantId: storeId,
            insuranceProviderId: provider.id,
          },
        });

        const recentClaims = await prisma.insuranceClaim.findMany({
          where: {
            merchantId: storeId,
            insuranceProviderId: provider.id,
          },
          select: {
            status: true,
            billedAmount: true,
            paidAmount: true,
          },
          orderBy: { submittedAt: "desc" },
          take: 10,
        });

        const approvedClaims = recentClaims.filter(c => c.status === "paid").length;
        const denialRate = recentClaims.length > 0 
          ? Math.round(((recentClaims.length - approvedClaims) / recentClaims.length) * 100)
          : 0;

        const avgPaymentRatio = recentClaims.length > 0 && recentClaims.some(c => c.paidAmount)
          ? Math.round((recentClaims.filter(c => c.paidAmount).reduce((sum, c) => 
              sum + (c.paidAmount! / c.billedAmount), 0) / 
              recentClaims.filter(c => c.paidAmount).length) * 100)
          : null;

        return {
          ...provider,
          claimCount,
          recentClaimsCount: recentClaims.length,
          approvalRate: recentClaims.length > 0 
            ? Math.round((approvedClaims / recentClaims.length) * 100)
            : 100,
          denialRate,
          avgPaymentRatio, // Percentage of billed amount typically paid
        };
      }));

      return NextResponse.json({
        success: true,
        data: providersWithStats,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[INSURANCE_PROVIDERS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Insurance Provider
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        name,
        payerId,
        type,
        phone,
        website,
      } = body;

      // Validation
      if (!name) {
        return NextResponse.json(
          { error: "Provider name is required" },
          { status: 400 }
        );
      }

      // Check if provider already exists
      const existingProvider = await prisma.insuranceProvider.findFirst({
        where: {
          merchantId: storeId,
          name: { equals: name, mode: "insensitive" },
        },
      });

      if (existingProvider) {
        return NextResponse.json(
          { error: "Insurance provider with this name already exists" },
          { status: 409 }
        );
      }

      const provider = await prisma.insuranceProvider.create({
        data: {
          merchantId: storeId,
          name,
          payerId,
          type: type || "commercial",
          phone,
          website,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: provider,
      });
    } catch (error: unknown) {
      logger.error("[INSURANCE_PROVIDERS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);