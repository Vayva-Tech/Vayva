import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/healthcare/lab-results
 * Returns lab results for patients
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");

    // In production, fetch from database
    const labResults = [
      {
        id: "lab-001",
        patientId: "1",
        patientName: "Maria Garcia",
        type: "Blood Test",
        title: "Comprehensive Metabolic Panel",
        orderedBy: "Dr. Sarah Johnson",
        orderedAt: new Date("2026-03-08").toISOString(),
        completedAt: new Date("2026-03-10").toISOString(),
        status: "completed",
        results: [
          { name: "Glucose", value: 142, unit: "mg/dL", flag: "high", range: "70-100" },
          { name: "HbA1c", value: 9.2, unit: "%", flag: "high", range: "4.0-5.6" },
          { name: "Creatinine", value: 1.0, unit: "mg/dL", flag: "normal", range: "0.7-1.3" },
          { name: "BUN", value: 18, unit: "mg/dL", flag: "normal", range: "7-20" },
        ],
        notes: "Patient needs diabetes management adjustment",
      },
      {
        id: "lab-002",
        patientId: "2",
        patientName: "James Wilson",
        type: "Imaging",
        title: "Chest X-Ray",
        orderedBy: "Dr. Sarah Johnson",
        orderedAt: new Date("2026-03-09").toISOString(),
        completedAt: new Date("2026-03-09").toISOString(),
        status: "completed",
        results: [
          { name: "Finding", value: "Normal", flag: "normal" },
        ],
        notes: "No abnormalities detected",
      },
    ];

    const filtered = patientId
      ? labResults.filter((result) => result.patientId === patientId)
      : labResults;

    return NextResponse.json({
      success: true,
      labResults: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Failed to fetch lab results:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lab results",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/healthcare/lab-results
 * Create new lab result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["patientId", "type", "title", "results"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // In production, save to database
    const newLabResult = {
      id: `lab-${Date.now()}`,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create lab result:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create lab result",
      },
      { status: 500 }
    );
  }
}
