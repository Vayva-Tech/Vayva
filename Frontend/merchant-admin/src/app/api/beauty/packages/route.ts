import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
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
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
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

      // Calculate package metrics
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
    } catch (error: unknown) {
      logger.error("[BEAUTY_PACKAGES_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/beauty/packages
 * Create a new package or membership
 */
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const validatedData = packageSchema.parse(body);

      // Validate that services exist if provided
      if (validatedData.services && validatedData.services.length > 0) {
        const servicesCount = await prisma.service.count({
          where: {
            id: { in: validatedData.services },
            merchantId: storeId,
          },
        });

        if (servicesCount !== validatedData.services.length) {
          return NextResponse.json(
            { error: "One or more services not found" },
            { status: 400 }
          );
        }
      }

      const pkg = await prisma.servicePackage.create({
        data: {
          merchantId: storeId,
          name: validatedData.name,
          description: validatedData.description,
          type: validatedData.type,
          price: validatedData.price,
          originalPrice: validatedData.originalPrice,
          validityDays: validatedData.validityDays,
          recurringPeriod: validatedData.recurringPeriod,
          benefits: validatedData.benefits,
          terms: validatedData.terms,
          imageUrl: validatedData.imageUrl,
          metadata: validatedData.metadata,
          status: "active",
        },
        include: {
          services: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      // Connect services if provided
      if (validatedData.services && validatedData.services.length > 0) {
        await prisma.servicePackage.update({
          where: { id: pkg.id },
          data: {
            services: {
              connect: validatedData.services.map((id) => ({ id })),
            },
          },
        });
      }

      logger.info("[BEAUTY_PACKAGES_POST] Package created", { 
        packageId: pkg.id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: pkg,
        message: "Package created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_PACKAGES_POST_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to create package" },
        { status: 500 }
      );
    }
  }
);
