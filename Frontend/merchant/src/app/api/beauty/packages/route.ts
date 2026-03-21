// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { z } from "zod";

const packageSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["PACKAGE", "MEMBERSHIP"]),
  price: z.number(),
  originalPrice: z.number().optional(),
  validityDays: z.number().optional(),
  recurringPeriod: z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]).optional(),
  services: z.array(z.string()).optional(), // Array of service IDs
  benefits: z.array(z.string()).optional(),
  terms: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/packages
 * Get all packages and memberships
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageType = searchParams.get("type");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {
      merchantId: storeId,
    };

    if (packageType) {
      where.type = packageType;
    }

    if (activeOnly) {
      where.status = "active";
    }

    const packages = await prisma.servicePackage.findMany({
      where,
      include: {
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const packagesWithMetrics = packages.map((pkg) => {
      const totalServicesValue = pkg.services.reduce((acc, service) => acc + (service.price || 0), 0);
      const savings = totalServicesValue - pkg.price;
      const savingsPercent = totalServicesValue > 0 ? ((savings / totalServicesValue) * 100) : 0;

      return {
        ...pkg,
        totalServicesValue,
        savings,
        savingsPercent,
      };
    });

    return NextResponse.json({
      success: true,
      data: packagesWithMetrics,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/packages",
      operation: "GET_PACKAGES",
    });
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
