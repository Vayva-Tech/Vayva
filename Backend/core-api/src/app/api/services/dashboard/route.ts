// ============================================================================
// GET /api/services/dashboard - Services/Bookings Dashboard Data
// ============================================================================
// Returns bookings, calendar schedule, staff utilization, and service metrics
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/services/dashboard
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Get time horizon
      const searchParams = req.nextUrl.searchParams;
      const dateParam = searchParams.get("date") || new Date().toISOString();
      const selectedDate = new Date(dateParam);
      
      // Calculate start and end of day
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Fetch all data in parallel
      const [
        bookings,
        services,
        staffMembers,
      ] = await Promise.all([
        // Get today's bookings
        prisma.booking.findMany({
          where: {
            storeId,
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            service: true,
          },
          orderBy: { startTime: "asc" },
        }),
        
        // Get services
        prisma.service.findMany({
          where: {
            storeId,
            active: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        
        // Get staff members
        prisma.staffMember.findMany({
          where: {
            storeId,
          },
        }),
      ]);
      
      // Calculate booking statistics
      const _confirmedBookings = bookings.filter(b => b.status === "confirmed");
      const cancelledBookings = bookings.filter(b => b.status === "cancelled");
      const noShows = bookings.filter(b => b.status === "no_show");
      const pendingBookings = bookings.filter(b => b.status === "pending");
      
      // Calculate staff utilization
      const totalStaffHours = staffMembers.length * 8; // Assuming 8-hour day
      const bookedHours = bookings.reduce((sum, booking) => {
        const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);
      
      const utilizationRate = totalStaffHours > 0 ? (bookedHours / totalStaffHours) * 100 : 0;
      
      // Get top booked services
      const serviceBookingsCount = services.map(service => ({
        ...service,
        bookingsCount: bookings.filter(b => b.serviceId === service.id).length,
      }));
      
      const topBookedServices = serviceBookingsCount
        .sort((a, b) => b.bookingsCount - a.bookingsCount)
        .slice(0, 5);
      
      // Prepare calendar events for the day
      const calendarEvents = bookings.map(booking => ({
        id: booking.id,
        title: `${booking.service.name}${booking.customerId ? ` - Customer ${booking.customerId}` : ""}`,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status as "confirmed" | "pending" | "cancelled",
        serviceId: booking.serviceId,
        staffId: booking.staffId,
      }));
      
      // Prepare dashboard data
      const dashboardData = {
        config: {
          industry: "services",
          title: "Bookings & Calendar",
          primaryObjectLabel: "Service",
        },
        metrics: {
          bookingsToday: bookings.length,
          revenue: 0, // Would need payment data
          utilizationRate: Math.round(utilizationRate),
          averageServiceValue: 0, // Would need pricing data
        },
        primaryObjectHealth: {
          topBookedServices: topBookedServices.map(s => ({
            id: s.id,
            name: s.name,
            bookingsCount: s.bookingsCount,
            price: Number(s.price),
          })),
          underperformingServices: serviceBookingsCount
            .filter(s => s.bookingsCount === 0)
            .slice(0, 5)
            .map(s => ({
              id: s.id,
              name: s.name,
              bookingsCount: 0,
            })),
        },
        liveOperations: {
          todaysBookings: bookings.length,
          cancellations: cancelledBookings.length,
          noShows: noShows.length,
          pending: pendingBookings.length,
        },
        calendar: {
          date: selectedDate.toISOString(),
          events: calendarEvents,
        },
        staff: {
          total: staffMembers.length,
          utilizationRate: Math.round(utilizationRate),
          members: staffMembers.map(member => ({
            id: member.id,
            name: member.name,
            role: member.role,
            utilizationRate: member.utilizationRate || 0,
          })),
        },
        alerts: [],
        suggestedActions: [],
      };
      
      return NextResponse.json(
        { 
          success: true, 
          data: dashboardData 
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Services dashboard error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch services dashboard data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
