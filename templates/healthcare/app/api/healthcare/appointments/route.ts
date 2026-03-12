import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/healthcare/appointments/today
 * Returns today's appointments
 */
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database for today's date
    const today = new Date().toISOString().split("T")[0];

    const appointments = [
      {
        id: "apt-001",
        patientId: "1",
        patientName: "John Smith",
        doctorId: "doc-001",
        doctorName: "Dr. Sarah Johnson",
        time: "08:00 AM",
        type: "Annual Physical",
        status: "checked-in",
        room: "Exam 1",
        notes: "Regular annual checkup",
        duration: 30,
      },
      {
        id: "apt-002",
        patientId: "2",
        patientName: "Emily Davis",
        doctorId: "doc-001",
        doctorName: "Dr. Sarah Johnson",
        time: "08:15 AM",
        type: "Follow-up",
        status: "in-room",
        room: "Exam 3",
        notes: "6-month follow-up",
        duration: 30,
      },
      {
        id: "apt-003",
        patientId: "3",
        patientName: "Michael Lee",
        doctorId: "doc-001",
        doctorName: "Dr. Sarah Johnson",
        time: "08:30 AM",
        type: "Consultation",
        status: "waiting",
        room: "Exam 2",
        notes: "Initial consultation",
        duration: 45,
      },
    ];

    return NextResponse.json({
      success: true,
      appointments,
      date: today,
      total: appointments.length,
    });
  } catch (error) {
    console.error("Failed to fetch today's appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/healthcare/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["patientId", "doctorId", "scheduledAt", "type"];
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
    const newAppointment = {
      id: `apt-${Date.now()}`,
      ...body,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        appointment: newAppointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create appointment",
      },
      { status: 500 }
    );
  }
}
