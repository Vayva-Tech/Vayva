import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/healthcare/alerts
 * Returns patient alerts (critical, warning, info)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    // In production, fetch from database
    const alerts = [
      {
        id: "alert-001",
        type: "critical",
        title: "Lab Results - HbA1c High",
        description: "Patient has HbA1c level of 9.2%",
        patientId: "1",
        patientName: "Maria Garcia",
        requiresAction: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert-002",
        type: "warning",
        title: "Allergy Alert",
        description: "Penicillin allergy detected - Amoxicillin prescribed",
        patientId: "2",
        patientName: "James Wilson",
        requiresAction: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert-003",
        type: "info",
        title: "Follow-up Required",
        description: "Post-surgery check due within 7 days",
        patientId: "3",
        patientName: "Susan Chen",
        requiresAction: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const filtered = type
      ? alerts.filter((alert) => alert.type === type)
      : alerts;

    return NextResponse.json({
      success: true,
      alerts: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch alerts",
      },
      { status: 500 }
    );
  }
}
