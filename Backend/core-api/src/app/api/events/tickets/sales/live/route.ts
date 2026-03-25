import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

/**
 * GET /api/events/tickets/sales/live
 * Returns real-time ticket sales feed
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const eventId = searchParams.get("eventId");
      const limit = parseInt(searchParams.get("limit") || "20");

      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Event ID is required" },
          { status: 400 }
        );
      }

      // Get recent ticket sales
      const sales = await prisma.order.findMany({
        where: {
          storeId,
          productId: eventId,
          type: "event_ticket",
          status: { in: ["completed", "processing"] },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          customer: {
            select: { name: true, email: true, phone: true },
          },
          lineItems: {
            select: {
              productName: true,
              quantity: true,
              price: true,
              metadata: true,
            },
          },
        },
      });

      // Format sales data
      const formattedSales = sales.map((sale) => {
        const ticketType = sale.lineItems[0]?.metadata?.ticketType || "General Admission";
        const quantity = sale.lineItems[0]?.quantity || 1;
        
        return {
          id: sale.id,
          customerName: sale.customer?.name || "Anonymous",
          customerEmail: sale.customer?.email,
          ticketType,
          quantity,
          price: sale.total,
          totalPrice: sale.total,
          timestamp: sale.createdAt,
          minutesAgo: Math.floor((new Date().getTime() - sale.createdAt.getTime()) / 60000),
          checkedIn: sale.metadata?.checkedIn || false,
          checkInTime: sale.metadata?.checkInTime || null,
          paymentMethod: sale.paymentMethod,
          status: sale.status,
        };
      });

      // Calculate sales velocity (tickets per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const _salesLastHour = sales.filter((s) => s.createdAt >= oneHourAgo).length;
      const ticketsSoldLastHour = sales
        .filter((s) => s.createdAt >= oneHourAgo)
        .reduce((sum, s) => sum + (s.lineItems[0]?.quantity || 1), 0);

      // Get today's total sales
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const todaySales = await prisma.order.aggregate({
        where: {
          storeId,
          productId: eventId,
          type: "event_ticket",
          status: { in: ["completed", "processing"] },
          createdAt: { gte: startOfDay },
        },
        _sum: { total: true },
        _count: true,
      });

      return NextResponse.json({
        success: true,
        data: {
          sales: formattedSales,
          summary: {
            todayRevenue: todaySales._sum.total || 0,
            todayTickets: todaySales._count,
            salesVelocity: ticketsSoldLastHour,
            peakVelocity: Math.max(ticketsSoldLastHour, 28), // Mock peak for now
          },
          breakdown: {
            vip: formattedSales.filter((s) => s.ticketType === "VIP").length,
            general: formattedSales.filter((s) => s.ticketType === "General").length,
            earlyBird: formattedSales.filter((s) => s.ticketType === "Early Bird").length,
            group: formattedSales.filter((s) => (s.quantity || 1) > 1).length,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching live ticket sales:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch live ticket sales" },
        { status: 500 }
      );
    }
  }
);
