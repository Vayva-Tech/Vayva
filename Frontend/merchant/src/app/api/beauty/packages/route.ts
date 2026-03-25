import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import type { Prisma } from "@vayva/db";

function isServiceEntry(v: unknown): v is { serviceId?: string; quantity?: number } {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * GET /api/beauty/packages
 * Get all packages and memberships
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: Prisma.ServicePackageWhereInput = { storeId };

    if (activeOnly) {
      where.isActive = true;
    }

    const packages = await prisma.servicePackage.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    const allServiceIds = new Set<string>();
    for (const pkg of packages) {
      const raw = pkg.services;
      if (Array.isArray(raw)) {
        for (const entry of raw) {
          if (isServiceEntry(entry) && typeof entry.serviceId === "string") {
            allServiceIds.add(entry.serviceId);
          }
        }
      }
    }

    const products =
      allServiceIds.size > 0
        ? await prisma.product.findMany({
            where: { id: { in: [...allServiceIds] }, storeId },
            select: { id: true, title: true, price: true, metadata: true },
          })
        : [];
    const productById = new Map(products.map((p) => [p.id, p]));

    const packagesWithMetrics = packages.map((pkg) => {
      const raw = pkg.services;
      const lines: Array<{ id: string; name: string; price: number; duration: number }> = [];
      if (Array.isArray(raw)) {
        for (const entry of raw) {
          if (isServiceEntry(entry) && typeof entry.serviceId === "string") {
            const p = productById.get(entry.serviceId);
            const duration =
              p?.metadata !== null &&
              p?.metadata !== undefined &&
              typeof p.metadata === "object" &&
              !Array.isArray(p.metadata) &&
              typeof (p.metadata as Record<string, unknown>).duration === "number"
                ? (p.metadata as Record<string, unknown>).duration
                : 0;
            lines.push({
              id: entry.serviceId,
              name: p?.title ?? "Service",
              price: p ? Number(p.price) : 0,
              duration: duration as number,
            });
          }
        }
      }

      const totalServicesValue = lines.reduce((acc, service) => acc + (service.price || 0), 0);
      const savings = totalServicesValue - Number(pkg.price);
      const savingsPercent = totalServicesValue > 0 ? (savings / totalServicesValue) * 100 : 0;

      return {
        ...pkg,
        services: lines,
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
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}
