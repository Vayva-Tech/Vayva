/**
 * GET /api/events/dashboard
 * Fetches event dashboard data from Events Industry Engine
 */

import { NextRequest, NextResponse } from "next/server";
import { EventsEngine } from "@vayva/industry-events";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get("eventId") || "event1";

    // Initialize Events Engine
    const engine = new EventsEngine({});
    await engine.initialize();

    // Get data from all features
    const [timelineStats, vendorStats, seatingStats, guestStats] = await Promise.all([
      engine.features?.timeline?.getStats?.() || {},
      engine.features?.vendors?.getStats?.() || {},
      engine.features?.seating?.getStats?.() || {},
      engine.features?.guests?.getStats?.() || {},
    ]);

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        timeline: timelineStats,
        vendors: vendorStats,
        seating: seatingStats,
        guests: guestStats,
        summary: {
          totalTimelineEvents: timelineStats.totalEvents || 0,
          completedEvents: timelineStats.completedEvents || 0,
          totalVendors: vendorStats.totalVendors || 0,
          pendingContracts: vendorStats.pendingContracts || 0,
          totalTables: seatingStats.totalTables || 0,
          seatingOccupancy: seatingStats.averageOccupancy || 0,
          totalGuests: guestStats.totalInvited || 0,
          confirmedGuests: guestStats.confirmed || 0,
          responseRate: guestStats.responseRate || 0,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[EVENTS_API_ERROR]", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to load event data" 
      },
      { status: 500 }
    );
  }
};
