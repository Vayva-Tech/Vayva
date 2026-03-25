import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import type { Prisma } from "@vayva/db";

function isWalkIn(metadata: Prisma.JsonValue | null | undefined): boolean {
  if (metadata === null || metadata === undefined || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }
  const rec = metadata as Record<string, unknown>;
  return rec.walkIn === true;
}

/**
 * GET /api/beauty/dashboard/overview
 * Returns comprehensive overview data for the beauty salon dashboard
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
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);

    const appointmentsToday = await prisma.booking.findMany({
      where: {
        storeId,
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            metadata: true,
          },
        },
      },
    });

    const revenueToday = appointmentsToday.reduce((sum, apt) => {
      return sum + (Number(apt.service?.price) || 0);
    }, 0);

    const totalAppointments = appointmentsToday.length;
    const completedAppointments = appointmentsToday.filter((apt) => apt.status === "COMPLETED").length;
    const cancelledAppointments = appointmentsToday.filter((apt) => apt.status === "CANCELLED").length;
    const noShows = appointmentsToday.filter((apt) => apt.status === "NO_SHOW").length;

    const now = new Date();
    const currentClients = appointmentsToday.filter((apt) => {
      const aptStart = new Date(apt.startsAt);
      const aptEnd = new Date(apt.endsAt || aptStart.getTime() + 60 * 60 * 1000);
      const inWindow = now >= aptStart && now <= aptEnd;
      return apt.status === "CONFIRMED" && inWindow;
    }).length;

    const walkinsToday = appointmentsToday.filter((apt) => isWalkIn(apt.metadata)).length;

    const productSales = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "PAID",
      },
      select: {
        total: true,
      },
    });

    const productRevenue = productSales.reduce((sum, order) => {
      return sum + (Number(order.total) || 0);
    }, 0);

    const serviceCount: Record<string, { count: number; revenue: number }> = {};
    appointmentsToday.forEach((apt) => {
      const serviceId = apt.serviceId;
      if (!serviceId) return;

      if (!serviceCount[serviceId]) {
        serviceCount[serviceId] = { count: 0, revenue: 0 };
      }
      serviceCount[serviceId].count++;
      serviceCount[serviceId].revenue += Number(apt.service?.price) || 0;
    });

    const topServices = Object.entries(serviceCount)
      .map(([serviceId, data]) => ({
        serviceId,
        serviceName:
          appointmentsToday.find((apt) => apt.serviceId === serviceId)?.service?.title || "Unknown",
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stylistRoles = await prisma.membership.findMany({
      where: {
        storeId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    const totalStylists = stylistRoles.length;
    const onDutyStylists =
      totalAppointments > 0 && totalStylists > 0 ? Math.min(totalStylists, totalAppointments) : 0;

    const inventoryRows = await prisma.inventoryItem.findMany({
      where: { product: { storeId } },
      select: { available: true, reorderPoint: true },
    });

    const lowStockCount = inventoryRows.filter(
      (row) => row.available <= (row.reorderPoint ?? 5)
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        revenue: revenueToday,
        appointments: totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShows,
        currentClients,
        walkins: walkinsToday,
        productSales: productRevenue,
        topServices,
        stylistsOnDuty: onDutyStylists,
        totalStylists: stylistRoles.length,
        lowStockCount,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/dashboard/overview",
      operation: "GET_BEAUTY_DASHBOARD_OVERVIEW",
    });
    return NextResponse.json(
      { error: "Failed to fetch beauty dashboard overview" },
      { status: 500 }
    );
  }
}
