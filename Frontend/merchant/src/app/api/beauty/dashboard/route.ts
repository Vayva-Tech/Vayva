import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import type { BookingStatus, Prisma } from "@vayva/db";

function countFromGroupByAgg(countField: unknown): number {
  if (typeof countField === "number") return countField;
  if (typeof countField === "object" && countField !== null && "_all" in countField) {
    const v = (countField as { _all: unknown })._all;
    return typeof v === "number" ? v : 0;
  }
  return 0;
}

// GET /api/beauty/dashboard - Get beauty salon dashboard metrics
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
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const bookingWhere: Prisma.BookingWhereInput = {
      storeId,
      status: { in: ["COMPLETED", "CONFIRMED"] as BookingStatus[] },
      startsAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    const [bookingsForRevenue, bookingsData, stylistMemberships, bookingsForServiceTally] =
      await Promise.all([
        prisma.booking.findMany({
          where: bookingWhere,
          include: {
            service: { select: { price: true, title: true, id: true } },
          },
        }),
        prisma.booking.groupBy({
          by: ["status"],
          where: {
            storeId,
            startsAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
          _count: true,
        }),
        prisma.membership.count({
          where: { storeId, status: "ACTIVE" },
        }),
        prisma.booking.findMany({
          where: {
            storeId,
            startsAt: { gte: fromDate, lte: toDate },
          },
          select: { serviceId: true },
        }),
      ]);

    const revenue = bookingsForRevenue.reduce((sum, b) => sum + Number(b.service.price), 0);
    const totalBookings = bookingsForRevenue.length;

    const bookingsByStatus: Record<string, number> = {};
    for (const item of bookingsData) {
      bookingsByStatus[item.status] = countFromGroupByAgg(item._count);
    }

    const avgBookingValue = totalBookings > 0 ? revenue / totalBookings : 0;

    const previousFrom = new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime()));
    const previousTo = fromDate;

    const previousBookings = await prisma.booking.findMany({
      where: {
        storeId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
        startsAt: { gte: previousFrom, lte: previousTo },
      },
      include: { service: { select: { price: true } } },
    });
    const previousRevenueValue = previousBookings.reduce((s, b) => s + Number(b.service.price), 0);
    const revenueGrowth =
      previousRevenueValue > 0 ? ((revenue - previousRevenueValue) / previousRevenueValue) * 100 : 0;

    const serviceCounts = new Map<string, number>();
    for (const row of bookingsForServiceTally) {
      serviceCounts.set(row.serviceId, (serviceCounts.get(row.serviceId) ?? 0) + 1);
    }
    const topTen = [...serviceCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const serviceIds = topTen.map(([serviceId]) => serviceId);
    const products =
      serviceIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: serviceIds }, storeId },
            select: { id: true, title: true, productType: true },
          })
        : [];
    const productById = new Map(products.map((p) => [p.id, p]));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          revenue,
          revenueGrowth,
          totalBookings,
          avgBookingValue,
          activeStylists: stylistMemberships,
        },
        bookings: {
          byStatus: bookingsByStatus,
          upcoming: bookingsByStatus["CONFIRMED"] || 0,
          completed: bookingsByStatus["COMPLETED"] || 0,
          cancelled: bookingsByStatus["CANCELLED"] || 0,
        },
        topServices: topTen.map(([serviceId, count]) => {
          const p = productById.get(serviceId);
          return {
            id: serviceId,
            name: p?.title ?? "Service",
            category: p?.productType ?? "",
            bookings: count,
          };
        }),
        period: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/dashboard",
      operation: "GET_BEAUTY_DASHBOARD",
    });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
