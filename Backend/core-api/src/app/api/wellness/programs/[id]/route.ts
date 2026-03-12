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

    const program = await prisma.wellnessProgram.findFirst({
      where: { id, storeId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            certifications: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate program status
    const daysUntilStart = Math.ceil((program.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isUpcoming = daysUntilStart > 0;
    const isInProgress = program.startDate <= new Date() && program.endDate >= new Date();
    const isCompleted = program.endDate < new Date();

    // Get enrollment statistics
    const [enrollmentStats, activeEnrollments] = await Promise.all([
      prisma.wellnessProgramEnrollment.groupBy({
        by: ['status'],
        where: { programId: id },
        _count: { id: true },
      }),
      prisma.wellnessProgramEnrollment.count({
        where: { programId: id, status: "active" },
      }),
    ]);

    const totalEnrollments = enrollmentStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const completedEnrollments = enrollmentStats.find(s => s.status === "completed")?._count.id || 0;

    // Parse JSON fields
    const programWithDetails = {
      ...program,
      meetingSchedule: JSON.parse(program.meetingSchedule || "[]"),
      prerequisites: JSON.parse(program.prerequisites || "[]"),
      learningObjectives: JSON.parse(program.learningObjectives || "[]"),
      materialsProvided: JSON.parse(program.materialsProvided || "[]"),
      instructor: {
        ...program.instructor,
        certifications: JSON.parse(program.instructor.certifications || "[]"),
      },
      statusInfo: {
        currentStatus: program.status,
        daysUntilStart,
        isUpcoming,
        isInProgress,
        isCompleted,
      },
      enrollment: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        droppedOut: totalEnrollments - activeEnrollments - completedEnrollments,
        spotsRemaining: Math.max(0, program.maxParticipants - totalEnrollments),
        utilizationRate: Math.round((totalEnrollments / program.maxParticipants) * 10000) / 100,
      },
    };

    return NextResponse.json(
      { data: programWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WELLNESS_PROGRAM_GET]", { error, programId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}