import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/healthcare/patients
 * Returns list of patients with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // In production, fetch from database with filters
    const patients = [
      {
        id: "1",
        firstName: "Maria",
        lastName: "Garcia",
        dateOfBirth: "1968-05-12",
        gender: "female" as const,
        bloodType: "O+" as const,
        phone: "+1-555-0101",
        email: "maria.garcia@email.com",
        insuranceProvider: "Blue Cross Blue Shield",
        allergies: ["Penicillin", "Peanuts"],
        chronicConditions: ["Type 2 Diabetes", "Hypertension"],
        lastVisit: new Date().toISOString(),
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        firstName: "James",
        lastName: "Wilson",
        dateOfBirth: "1985-08-23",
        gender: "male" as const,
        bloodType: "A+" as const,
        phone: "+1-555-0102",
        email: "james.wilson@email.com",
        insuranceProvider: "Aetna",
        allergies: ["Pollen"],
        chronicConditions: [],
        lastVisit: new Date().toISOString(),
        createdAt: new Date("2024-02-20").toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        firstName: "Emily",
        lastName: "Davis",
        dateOfBirth: "1992-03-15",
        gender: "female" as const,
        bloodType: "B+" as const,
        phone: "+1-555-0103",
        email: "emily.davis@email.com",
        insuranceProvider: "UnitedHealth",
        allergies: [],
        chronicConditions: ["Asthma"],
        lastVisit: new Date("2025-09-15").toISOString(),
        createdAt: new Date("2023-11-10").toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      patients: patients.slice(0, limit),
      total: patients.length,
      page,
      limit,
    });
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patients",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/healthcare/patients
 * Create a new patient record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "dateOfBirth", "gender"];
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
    const newPatient = {
      id: `patient-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        patient: newPatient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create patient",
      },
      { status: 500 }
    );
  }
}
