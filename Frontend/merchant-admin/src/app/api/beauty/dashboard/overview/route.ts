import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/beauty/dashboard/overview
 * Returns comprehensive overview data for the beauty salon dashboard
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];
      
      const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);

      // Fetch appointments for today
      const appointmentsToday = await prisma.booking?.findMany({
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
      }) || [];

      // Calculate metrics
      const revenueToday = appointmentsToday.reduce((sum, apt) => {
        return sum + (Number(apt.service?.price) || 0);
      }, 0);

      const totalAppointments = appointmentsToday.length;
      const completedAppointments = appointmentsToday.filter(
        (apt) => apt.status === "COMPLETED"
      ).length;
      const cancelledAppointments = appointmentsToday.filter(
        (apt) => apt.status === "CANCELLED"
      ).length;
      const noShows = appointmentsToday.filter(
        (apt) => apt.status === "NO_SHOW"
      ).length;

      // Get current clients in salon
      const now = new Date();
      const currentClients = appointmentsToday.filter((apt) => {
        const aptStart = new Date(apt.startsAt);
        const aptEnd = new Date(apt.endsAt || aptStart.getTime() + 60 * 60 * 1000);
        return apt.status === "IN_PROGRESS" || (now >= aptStart && now <= aptEnd);
      }).length;

      // Walk-ins (appointments without advance booking or marked as walk-in)
      const walkinsToday = appointmentsToday.filter(
        (apt) => (apt.metadata as any)?.walkIn === true
      ).length;

      // Product sales today (from orders)
      const productSales = await prisma.order?.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          orderType: "RETAIL",
        },
        select: {
          totalPrice: true,
        },
      }) || [];

      const productRevenue = productSales.reduce((sum, order) => {
        return sum + (Number(order.totalPrice) || 0);
      }, 0);

      // Top booked services today
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
          serviceName: appointmentsToday.find((apt) => apt.serviceId === serviceId)?.service?.title || "Unknown",
          count: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Stylist availability
      const stylists = await prisma.user?.findMany({
        where: {
          storeId,
          role: "STYLIST",
        },
        include: {
          bookings: {
            where: {
              startsAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          },
        },
      }) || [];

      const onDutyStylists = stylists.filter((stylist) => {
        const hasBookingToday = stylist.bookings && stylist.bookings.length > 0;
        return hasBookingToday;
      }).length;

      // Low stock products
      const lowStockProducts = await prisma.product?.findMany({
        where: {
          storeId,
          productType: "RETAIL",
          inventoryTracking: true,
        },
        select: {
          id: true,
          title: true,
          stockQuantity: true,
          lowStockThreshold: true,
        },
      }) || [];

      const lowStockCount = lowStockProducts.filter(
        (p) => (p.stockQuantity || 0) <= (p.lowStockThreshold || 5)
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
          totalStylists: stylists.length,
          lowStockCount,
        },
      });
    } catch (error) {
      logger.error("[BEAUTY_DASHBOARD_OVERVIEW] Error fetching overview", { storeId, error });
      return NextResponse.json(
        { error: "Failed to fetch beauty dashboard overview" },
        { status: 500 }
      );
    }
  }
);
