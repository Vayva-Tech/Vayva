import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

/**
 * GET /api/beauty/services/performance
 * Returns service menu performance data
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);

    // Fetch all services (products with type SERVICE)
    const services = await prisma.product?.findMany({
      where: {
        storeId,
        productType: "SERVICE",
      },
      include: {
        bookings: {
          where: {
            startsAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: "COMPLETED",
          },
        },
      },
    }) || [];

    // Calculate performance for each service
    const servicePerformance = services.map((service) => {
      const bookingsToday = service.bookings || [];
      const totalBookings = bookingsToday.length;
      const totalRevenue = bookingsToday.reduce(
        (sum, apt) => sum + (Number(service.price) || 0),
        0
      );

      // Calculate average duration from metadata
      const metadata = service.metadata as Record<string, any> | null;
      const avgDuration = metadata?.durationMinutes ? Number(metadata.durationMinutes) : 60;

      return {
        id: service.id,
        name: service.title,
        category: metadata?.category || "General",
        price: Number(service.price) || 0,
        bookingsToday: totalBookings,
        revenueToday: totalRevenue,
        avgDuration,
        capacity: Math.floor((8 * 60) / avgDuration), // Assuming 8-hour day
        utilization: totalBookings > 0 ? (totalBookings / Math.max(1, Math.floor((8 * 60) / avgDuration))) * 100 : 0,
      };
    });

    // Sort by bookings count
    const topServices = [...servicePerformance]
      .sort((a, b) => b.bookingsToday - a.bookingsToday)
      .slice(0, 10);

    // Group by category
    const categoryBreakdown = servicePerformance.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = { count: 0, services: [] as typeof servicePerformance };
      }
      acc[category].count++;
      acc[category].services.push(service);
      return acc;
    }, {} as Record<string, { count: number; services: typeof servicePerformance }>);

    // Calculate overall metrics
    const totalRevenue = servicePerformance.reduce(
      (sum, service) => sum + service.revenueToday,
      0
    );
    const totalBookings = servicePerformance.reduce(
      (sum, service) => sum + service.bookingsToday,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        services: servicePerformance,
        topServices,
        categoryBreakdown,
        summary: {
          totalRevenue,
          totalBookings,
          avgServicePrice: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        },
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/beauty/services/performance',
      operation: 'GET_SERVICE_PERFORMANCE',
    });
    return NextResponse.json(
      { error: 'Failed to fetch service performance' },
      { status: 500 }
    );
  }
}
