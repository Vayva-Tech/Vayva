import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { resolveDashboardPlanTier } from "@/config/dashboard-variants";

/**
 * GET /api/dashboard/events
 * Returns aggregate metrics for Events dashboard
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId, user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const eventId = searchParams.get("eventId");
      
      // Get user's plan tier for feature gating
      const merchant = await prisma.merchant.findUnique({
        where: { id: user.merchantId },
        select: { plan: true },
      });
      const planTier = resolveDashboardPlanTier(merchant?.plan || "free");
      const isPro = planTier === "advanced" || planTier === "pro";

      // Get current active event
      const activeEvent = eventId 
        ? await prisma.product.findFirst({
            where: { 
              id: eventId,
              storeId,
              type: "event",
            },
          })
        : await prisma.product.findFirst({
            where: { 
              storeId,
              type: "event",
              status: "active",
            },
            orderBy: { createdAt: "desc" },
          });

      if (!activeEvent) {
        return NextResponse.json({
          success: true,
          data: {
            hasActiveEvent: false,
            metrics: null,
            liveSales: [],
            checkInStats: null,
            eventTimeline: null,
          },
        });
      }

      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      // Calculate revenue from successful orders
      const revenuePromise = prisma.order.aggregate({
        where: {
          storeId,
          status: "completed",
          productId: activeEvent.id,
          paymentStatus: "paid",
        },
        _sum: { total: true },
      });

      // Count tickets sold
      const ticketsSoldPromise = prisma.order.count({
        where: {
          storeId,
          productId: activeEvent.id,
          status: { in: ["completed", "processing"] },
        },
      });

      // Count attendees who checked in
      const attendeesPromise = prisma.order.count({
        where: {
          storeId,
          productId: activeEvent.id,
          metadata: {
            path: ["checkedIn"],
            equals: true,
          },
        },
      });

      // Count sponsors (products with type 'sponsorship')
      const sponsorsPromise = prisma.product.count({
        where: {
          storeId,
          type: "sponsorship",
          metadata: {
            path: ["eventId"],
            equals: activeEvent.id,
          },
        },
      });

      // Get sponsor total value
      const sponsorValuePromise = prisma.product.aggregate({
        where: {
          storeId,
          type: "sponsorship",
          metadata: {
            path: ["eventId"],
            equals: activeEvent.id,
          },
        },
        _sum: { price: true },
      });

      // Calculate conversion rate (orders / page views)
      const conversionPromise = prisma.analytics.groupBy({
        by: ["eventType"],
        where: {
          storeId,
          productId: activeEvent.id,
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
        _count: true,
      });

      // Get last 5 ticket sales (live feed)
      const liveSalesPromise = prisma.order.findMany({
        where: {
          storeId,
          productId: activeEvent.id,
          status: { in: ["completed", "processing"] },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: {
            select: { name: true, email: true },
          },
        },
      });

      // Get check-in statistics
      const checkInStatsPromise = prisma.order.findMany({
        where: {
          storeId,
          productId: activeEvent.id,
          metadata: {
            path: ["checkedIn"],
            equals: true,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          customer: { select: { name: true, email: true } },
          total: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Execute all queries
      const [
        revenueResult,
        ticketsSold,
        attendees,
        sponsors,
        sponsorValueResult,
        conversionData,
        liveSales,
        checkInStats,
      ] = await Promise.all([
        revenuePromise,
        ticketsSoldPromise,
        attendeesPromise,
        sponsorsPromise,
        sponsorValuePromise,
        conversionPromise,
        liveSalesPromise,
        checkInStatsPromise,
      ]);

      const totalRevenue = revenueResult._sum.total || 0;
      const totalSponsorValue = sponsorValueResult._sum.price || 0;

      // Calculate conversion rate
      const views = conversionData.find((d) => d.eventType === "view")?._count || 0;
      const purchases = conversionData.find((d) => d.eventType === "purchase")?._count || 0;
      const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

      // Format live sales
      const formattedLiveSales = liveSales.map((sale) => ({
        id: sale.id,
        customerName: sale.customer?.name || "Anonymous",
        ticketType: sale.metadata?.ticketType || "General Admission",
        price: sale.total,
        timestamp: sale.createdAt,
        minutesAgo: Math.floor((new Date().getTime() - sale.createdAt.getTime()) / 60000),
        checkedIn: sale.metadata?.checkedIn || false,
      }));

      // Calculate growth percentages (comparing to previous period)
      const previousPeriodStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const previousRevenue = await prisma.order.aggregate({
        where: {
          storeId,
          productId: activeEvent.id,
          status: "completed",
          paymentStatus: "paid",
          createdAt: { gte: previousPeriodStart, lt: today },
        },
        _sum: { total: true },
      });

      const previousTickets = await prisma.order.count({
        where: {
          storeId,
          productId: activeEvent.id,
          status: { in: ["completed", "processing"] },
          createdAt: { gte: previousPeriodStart, lt: today },
        },
      });

      const revenueGrowth = previousRevenue._sum.total 
        ? ((totalRevenue - (previousRevenue._sum.total || 0)) / previousRevenue._sum.total) * 100 
        : 0;
      
      const ticketsGrowth = previousTickets 
        ? ((ticketsSold - previousTickets) / previousTickets) * 100 
        : 0;

      // Build event timeline
      const eventTimeline = {
        eventDate: activeEvent.metadata?.eventDate,
        daysUntilEvent: activeEvent.metadata?.eventDate
          ? Math.ceil((new Date(activeEvent.metadata.eventDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        schedule: activeEvent.metadata?.schedule || [],
        venueCapacity: activeEvent.metadata?.venueCapacity || null,
        venueLayout: activeEvent.metadata?.venueLayout || null,
      };

      return NextResponse.json({
        success: true,
        data: {
          hasActiveEvent: true,
          event: {
            id: activeEvent.id,
            title: activeEvent.name,
            status: activeEvent.status,
          },
          metrics: {
            revenue: {
              value: totalRevenue,
              change: parseFloat(revenueGrowth.toFixed(1)),
              trend: revenueGrowth >= 0 ? "up" : "down",
              isLive: true,
            },
            ticketsSold: {
              value: ticketsSold,
              change: parseFloat(ticketsGrowth.toFixed(1)),
              trend: ticketsGrowth >= 0 ? "up" : "down",
              isLive: true,
            },
            attendees: {
              value: attendees,
              change: 0, // Would need historical data for comparison
              trend: "up",
              isLive: true,
            },
            sponsors: {
              value: sponsors,
              totalValue: totalSponsorValue,
            },
            conversionRate: {
              value: parseFloat(conversionRate.toFixed(1)),
              change: 0,
              trend: "up",
            },
          },
          liveSales: formattedLiveSales,
          checkInStats: {
            total: checkInStats.length,
            recent: checkInStats.map((checkIn) => ({
              id: checkIn.id,
              customerName: checkIn.customer?.name || "Anonymous",
              timestamp: checkIn.updatedAt,
              scannedAt: checkIn.metadata?.scannedAt || checkIn.updatedAt,
            })),
          },
          eventTimeline,
          // Pro-tier features
          ...(isPro && {
            aiInsights: {
              demandAlert: totalRevenue > 10000 ? "high" : "normal",
              recommendation: ticketsSold > 800 ? "Consider adding VIP capacity" : "Continue current marketing",
              predictedRevenue: totalRevenue * 1.15,
            },
          }),
        },
      });
    } catch (error) {
      console.error("Error fetching events dashboard:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch events dashboard" },
        { status: 500 }
      );
    }
  }
);
