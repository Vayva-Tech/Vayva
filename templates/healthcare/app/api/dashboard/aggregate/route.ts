import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/aggregate
 * Returns aggregate metrics for the healthcare dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    const stats = {
      totalPatients: 2847,
      appointmentsToday: 42,
      currentQueue: 18,
      prescriptions: 156,
      revenue: 18400,
      avgWaitTime: 12,
      patientGrowth: 8.2,
      appointmentGrowth: 12.5,
      prescriptionGrowth: 15.3,
      revenueGrowth: 9.4,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch aggregate stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}
