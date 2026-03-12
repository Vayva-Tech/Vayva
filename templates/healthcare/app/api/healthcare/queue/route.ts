import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/healthcare/queue
 * Returns current patient queue status
 */
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    const queue = {
      totalPatients: 18,
      waitingRoom: [
        {
          id: "q-001",
          patientId: "1",
          patientName: "Maria Garcia",
          checkInTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          waitTime: 15,
          status: "waiting",
        },
        {
          id: "q-002",
          patientId: "2",
          patientName: "James Wilson",
          checkInTime: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
          waitTime: 22,
          status: "waiting",
        },
        {
          id: "q-003",
          patientId: "3",
          patientName: "Susan Chen",
          checkInTime: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
          waitTime: 28,
          status: "waiting",
        },
      ],
      inExam: [
        {
          id: "q-004",
          patientId: "4",
          patientName: "Maria G.",
          room: "Exam 1",
          provider: "Dr. Johnson",
          status: "in-exam",
        },
        {
          id: "q-005",
          patientId: "5",
          patientName: "Emily D.",
          room: "Exam 3",
          provider: "Dr. Johnson",
          status: "in-exam",
        },
      ],
      withProvider: [
        {
          id: "q-006",
          provider: "Dr. Johnson",
          count: 3,
        },
        {
          id: "q-007",
          provider: "Dr. Williams",
          count: 1,
        },
        {
          id: "q-008",
          provider: "PA Martinez",
          count: 2,
        },
      ],
      analytics: {
        avgWaitTime: 18,
        avgVisitTime: 32,
        currentWaitTime: 12,
      },
    };

    return NextResponse.json({
      success: true,
      queue,
    });
  } catch (error) {
    console.error("Failed to fetch queue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch queue",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/healthcare/queue/add
 * Add patient to queue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["patientId", "appointmentType"];
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

    // In production, add to database
    const queueEntry = {
      id: `q-${Date.now()}`,
      ...body,
      checkInTime: new Date().toISOString(),
      status: "waiting",
    };

    return NextResponse.json(
      {
        success: true,
        queueEntry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add to queue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add to queue",
      },
      { status: 500 }
    );
  }
}
