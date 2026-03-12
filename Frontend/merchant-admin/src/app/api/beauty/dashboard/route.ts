import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/beauty/dashboard - Get beauty salon dashboard metrics
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      // Fetch all metrics in parallel
      const [
        revenueData,
        bookingsData,
        stylistsData,
        servicesData
      ] = await Promise.all([
        // Revenue from bookings
        prisma.$queryRaw`
          SELECT 
            COALESCE(SUM(b.totalAmount), 0) as total_revenue,
            COUNT(DISTINCT b.id) as total_bookings
          FROM Booking b
          WHERE b.merchant_id = ${storeId}
            AND b.status IN ('completed', 'confirmed')
            AND b."scheduledAt" BETWEEN ${fromDate} AND ${toDate}
        `,
        
        // Bookings count and status breakdown
        prisma.booking.groupBy({
          by: ['status'],
          where: {
            merchantId: storeId,
            scheduledAt: {
              gte: fromDate,
              lte: toDate
            }
          },
          _count: true
        }),
        
        // Active stylists
        prisma.staffMember.count({
          where: {
            merchantId: storeId,
            status: 'active'
          }
        }),
        
        // Popular services
        prisma.service.groupBy({
          by: ['id', 'name', 'category'],
          where: {
            merchantId: storeId,
            status: 'active'
          },
          _count: {
            bookings: true
          },
          orderBy: {
            bookings: {
              _count: 'desc'
            }
          },
          take: 10
        })
      ]);

      // Process revenue data
      const revenue = Number((revenueData as any)[0]?.total_revenue || 0);
      const totalBookings = Number((revenueData as any)[0]?.total_bookings || 0);

      // Process bookings by status
      const bookingsByStatus: Record<string, number> = {};
      (bookingsData as Array<{ status: string; _count: number }>).forEach(item => {
        bookingsByStatus[item.status] = item._count;
      });

      // Calculate average booking value
      const avgBookingValue = totalBookings > 0 ? revenue / totalBookings : 0;

      // Get previous period for comparison
      const previousFrom = new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime()));
      const previousTo = fromDate;

      const previousRevenue = await prisma.$queryRaw`
        SELECT COALESCE(SUM(b.totalAmount), 0) as total_revenue
        FROM Booking b
        WHERE b.merchant_id = ${storeId}
          AND b.status IN ('completed', 'confirmed')
          AND b."scheduledAt" BETWEEN ${previousFrom} AND ${previousTo}
      `;

      const previousRevenueValue = Number((previousRevenue as any)[0]?.total_revenue || 0);
      const revenueGrowth = previousRevenueValue > 0 
        ? ((revenue - previousRevenueValue) / previousRevenueValue) * 100 
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            revenue,
            revenueGrowth,
            totalBookings,
            avgBookingValue,
            activeStylists: stylistsData
          },
          bookings: {
            byStatus: bookingsByStatus,
            upcoming: bookingsByStatus['scheduled'] || 0,
            completed: bookingsByStatus['completed'] || 0,
            cancelled: bookingsByStatus['cancelled'] || 0
          },
          topServices: servicesData.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            bookings: s._count.bookings
          })),
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_DASHBOARD_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch beauty dashboard data" },
        { status: 500 }
      );
    }
  }
);
