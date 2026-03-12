import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const servicePackageSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  services: z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().int().min(1).default(1),
  })).min(1),
  totalSessions: z.number().int().min(1),
  validityDays: z.number().int().min(1),
  price: z.number().positive(),
  savings: z.number().min(0).default(0),
});

const packageUpdateSchema = servicePackageSchema.partial();

/**
 * GET /api/services/packages?storeId=xxx&isActive=xxx
 * List service packages for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const isActive = searchParams.get("isActive");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (isActive !== null) where.isActive = isActive === "true";

    const packages = await prisma.servicePackage?.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const stats = {
      total: packages.length,
      active: packages.filter((p: { isActive: boolean }) => p.isActive).length,
      inactive: packages.filter((p: { isActive: boolean }) => !p.isActive).length,
      avgPrice: packages.length > 0
        ? packages.reduce((sum: number, p: { price: { toNumber: () => number } }) => sum + p.price.toNumber(), 0) / packages.length
        : 0,
      totalSavings: packages.reduce((sum: number, p: { savings: { toNumber: () => number } }) => sum + p.savings.toNumber(), 0),
    };

    return NextResponse.json({ packages, stats });
  } catch (error: unknown) {
    logger.error("[SERVICE_PACKAGES_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch service packages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services/packages
 * Create a new service package
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = servicePackageSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Verify all services exist and calculate savings if not provided
    const serviceIds = validated.services?.map((s: { serviceId: string }) => s.serviceId);
    const services = await prisma.product?.findMany({
      where: {
        id: { in: serviceIds },
        storeId,
        productType: "SERVICE",
      },
    });

    if (services.length !== serviceIds.length) {
      const foundIds = services.map((s: { id: string }) => s.id);
      const missingIds = serviceIds.filter((id: string) => !foundIds.includes(id));
      return NextResponse.json(
        { error: "Some services not found", missingIds },
        { status: 404 }
      );
    }

    // Calculate savings if not provided
    let savings = validated.savings;
    if (savings === 0) {
      const individualTotal = validated.services?.reduce((sum, s: { serviceId: string; quantity: number }) => {
        const service = services.find((svc: { id: string }) => svc.id === s.serviceId);
        return sum + (service ? Number(service.price) * s.quantity : 0);
      }, 0);
      savings = individualTotal - validated.price;
    }

    const packageData = await prisma.servicePackage?.create({
      data: {
        storeId,
        name: validated.name,
        description: validated.description,
        services: validated.services,
        totalSessions: validated.totalSessions,
        validityDays: validated.validityDays,
        price: validated.price,
        savings: savings > 0 ? savings : 0,
        isActive: true,
      },
    });

    logger.info("[SERVICE_PACKAGES_POST] Created", {
      packageId: packageData.id,
      storeId,
      name: validated.name,
    });

    return NextResponse.json({ package: packageData }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[SERVICE_PACKAGES_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create service package" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/services/packages?id=xxx
 * Update a service package
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Package ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = packageUpdateSchema.parse(body);

    const packageData = await prisma.servicePackage?.update({
      where: { id },
      data: validated,
    });

    logger.info("[SERVICE_PACKAGES_PATCH] Updated", { packageId: id });

    return NextResponse.json({ package: packageData });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[SERVICE_PACKAGES_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update service package" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/packages?id=xxx
 * Deactivate a service package
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Package ID required" },
        { status: 400 }
      );
    }

    const packageData = await prisma.servicePackage?.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    logger.info("[SERVICE_PACKAGES_DELETE] Deactivated", { packageId: id });

    return NextResponse.json({ package: packageData });
  } catch (error: unknown) {
    logger.error("[SERVICE_PACKAGES_DELETE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to deactivate service package" },
      { status: 500 }
    );
  }
}
