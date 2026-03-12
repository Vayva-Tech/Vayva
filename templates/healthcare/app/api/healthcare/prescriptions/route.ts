import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/healthcare/prescriptions
 * Returns list of prescriptions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // In production, fetch from database
    const prescriptions = [
      {
        id: "rx-001",
        patientId: "1",
        patientName: "Maria Garcia",
        doctorId: "doc-001",
        medications: [
          {
            name: "Metformin",
            dosage: "500mg",
            frequency: "2x daily",
            duration: "30 days",
          },
        ],
        issuedAt: new Date().toISOString(),
        status: "active",
        refillsAllowed: 3,
        refillsUsed: 0,
      },
      {
        id: "rx-002",
        patientId: "2",
        patientName: "John Doe",
        doctorId: "doc-001",
        medications: [
          {
            name: "Oxycodone",
            dosage: "5mg",
            frequency: "As needed",
            duration: "7 days",
          },
        ],
        issuedAt: new Date().toISOString(),
        status: "pending",
        controlled: true,
        refillsAllowed: 0,
        refillsUsed: 0,
      },
    ];

    const filtered = status
      ? prescriptions.filter((rx) => rx.status === status)
      : prescriptions;

    return NextResponse.json({
      success: true,
      prescriptions: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch prescriptions",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/healthcare/prescriptions
 * Create a new prescription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["patientId", "doctorId", "medications"];
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

    // In production, save to database and send to pharmacy
    const newPrescription = {
      id: `rx-${Date.now()}`,
      ...body,
      status: "active",
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        prescription: newPrescription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create prescription",
      },
      { status: 500 }
    );
  }
}
