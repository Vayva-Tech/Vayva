import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const session = await prisma.wellnessSession.findFirst({
      where: { id, storeId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            bio: true,
            certifications: true,
            yearsOfExperience: true,
          },
        },
        attendance: {
          select: {
            id: true,
            clientId: true,
            attendedAt: true,
            status: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { attendedAt: "desc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate session metrics
    const totalAttendance = session.attendance.length;
    const confirmedAttendance = session.attendance.filter(a => a.status === "attended").length;
    const noShowCount = session.attendance.filter(a => a.status === "no_show").length;
    
    const attendanceRate = totalAttendance > 0 
      ? Math.round((confirmedAttendance / totalAttendance) * 10000) / 100
      : 0;

    // Parse JSON fields
    const sessionWithMetrics = {
      ...session,
      equipmentNeeded: JSON.parse(session.equipmentNeeded || "[]"),
      prerequisites: JSON.parse(session.prerequisites || "[]"),
      instructor: {
        ...session.instructor,
        certifications: JSON.parse(session.instructor.certifications || "[]"),
      },
      metrics: {
        totalRegistered: totalAttendance,
        confirmedAttendance,
        noShowCount,
        attendanceRate,
        utilizationRate: session.capacity > 0 
          ? Math.round((totalAttendance / session.capacity) * 10000) / 100
          : 0,
        spotsRemaining: Math.max(0, session.capacity - totalAttendance),
      },
      timing: {
        durationMinutes: Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)),
        timeUntilStart: Math.ceil((session.startTime.getTime() - Date.now()) / (1000 * 60)),
        isUpcoming: session.startTime > new Date(),
        isInProgress: session.startTime <= new Date() && session.endTime >= new Date(),
        isCompleted: session.endTime < new Date(),
      },
    };

    return NextResponse.json(
      { data: sessionWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WELLNESS_SESSION_GET]", { error, sessionId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}