/**
 * GET /api/automotive/dashboard
 * Fetches automotive dashboard data from Automotive Industry Engine
 */

import { NextRequest, NextResponse } from "next/server";
import { AutomotiveEngine } from "@vayva/industry-automotive";

export const GET = async (req: NextRequest) => {
  try {
    // Initialize Automotive Engine
    const engine = new AutomotiveEngine({});
    await engine.initialize();

    // Get data from all features
    const [inventoryStats, serviceStats, retailStats] = await Promise.all([
      engine.features?.inventory?.getStats?.() || {},
      engine.features?.serviceScheduler?.getStats?.() || {},
      engine.features?.digitalRetail?.getStats?.() || {},
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inventory: inventoryStats,
        service: serviceStats,
        retail: retailStats,
        summary: {
          totalVehicles: inventoryStats.totalVehicles || 0,
          availableVehicles: inventoryStats.availableVehicles || 0,
          lowStockItems: inventoryStats.lowStockItems || 0,
          upcomingAppointments: serviceStats.upcomingAppointments || 0,
          technicianUtilization: serviceStats.technicianUtilization || 0,
          activeFinanceApplications: retailStats.activeFinanceApplications || 0,
          pendingTradeIns: retailStats.pendingTradeIns || 0,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[AUTOMOTIVE_API_ERROR]", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to load automotive data" 
      },
      { status: 500 }
    );
  }
};
