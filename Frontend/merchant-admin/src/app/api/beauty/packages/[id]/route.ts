import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const updatePackageSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["PACKAGE", "MEMBERSHIP"]).optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  validityDays: z.number().optional(),
  recurringPeriod: z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]).optional(),
  services: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  terms: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/packages/[id]
 * Get specific package details
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const pkg = await prisma.servicePackage.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
        include: {
          services: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
              description: true,
            },
          },
        },
      });

      if (!pkg) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        );
      }

      // Calculate metrics
      const totalServicesValue = pkg.services.reduce((acc, service) => acc + (service.price || 0), 0);
      const savings = totalServicesValue - pkg.price;
      const savingsPercent = totalServicesValue > 0 ? ((savings / totalServicesValue) * 100) : 0;

      // Get purchase count
      const purchaseCount = await prisma.order.count({
        where: {
          metadata: {
            path: ["packageId"],
            equals: id,
          },
          merchantId: storeId,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...pkg,
          totalServicesValue,
          savings,
          savingsPercent,
          purchaseCount,
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_PACKAGES_ID_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch package" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/beauty/packages/[id]
 * Update an existing package or membership
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = updatePackageSchema.parse(body);

      // Verify package exists
      const existingPackage = await prisma.servicePackage.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!existingPackage) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        );
      }

      // Validate services if provided
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

      // Update package
      const updatedPackage = await prisma.servicePackage.update({
        where: { id },
        data: validatedData,
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

      // Update services connection if provided
      if (validatedData.services) {
        // Disconnect all current services
        await prisma.servicePackage.update({
          where: { id },
          data: {
            services: {
              set: [],
            },
          },
        });

        // Connect new services
        if (validatedData.services.length > 0) {
          await prisma.servicePackage.update({
            where: { id },
            data: {
              services: {
                connect: validatedData.services.map((sid) => ({ id: sid })),
              },
            },
          });
        }
      }

      logger.info("[BEAUTY_PACKAGES_ID_PUT] Package updated", { 
        packageId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: updatedPackage,
        message: "Package updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_PACKAGES_ID_PUT_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to update package" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/beauty/packages/[id]
 * Delete or archive a package
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      // Verify package exists
      const existingPackage = await prisma.servicePackage.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!existingPackage) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        );
      }

      // Check if package has active purchases
      const activePurchases = await prisma.order.count({
        where: {
          metadata: {
            path: ["packageId"],
            equals: id,
          },
          merchantId: storeId,
          status: {
            in: ["PENDING", "CONFIRMED", "COMPLETED"],
          },
        },
      });

      if (activePurchases > 0) {
        // Soft delete by archiving
        await prisma.servicePackage.update({
          where: { id },
          data: {
            status: "archived",
          },
        });

        logger.info("[BEAUTY_PACKAGES_ID_DELETE] Package archived", { 
          packageId: id,
          storeId,
          activePurchases 
        });

        return NextResponse.json({
          success: true,
          message: `Package archived (${activePurchases} active purchases)`,
        });
      }

      // Hard delete if no active purchases
      await prisma.servicePackage.delete({
        where: { id },
      });

      logger.info("[BEAUTY_PACKAGES_ID_DELETE] Package deleted", { 
        packageId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        message: "Package deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_PACKAGES_ID_DELETE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to delete package" },
        { status: 500 }
      );
    }
  }
);
