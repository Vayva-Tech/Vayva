import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.PROGRAMS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let programIdForLog = "";
    try {
      const { id } = await params;
      programIdForLog = id;

      const program = await prisma.wellnessProgram.findFirst({
        where: { id, storeId },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
              bio: true,
            },
          },
          enrollments: {
            where: { storeId },
            select: {
              id: true,
              clientId: true,
              enrolledAt: true,
              status: true,
              progress: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { enrolledAt: "asc" },
          },
        },
      });

      if (!program) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const totalEnrollments = program.enrollments.length;
      const activeEnrollments = program.enrollments.filter(
        (e) => e.status === "active",
      ).length;
      const completedEnrollments = program.enrollments.filter(
        (e) => e.status === "completed",
      ).length;

      const averageProgress =
        activeEnrollments > 0
          ? Math.round(
              (program.enrollments
                .filter((e) => e.status === "active")
                .reduce((sum, e) => sum + (e.progress || 0), 0) /
                activeEnrollments) *
                100,
            ) / 100
          : 0;

      const programWithParticipants = {
        ...program,
        meetingSchedule: JSON.parse(program.meetingSchedule || "[]"),
        prerequisites: JSON.parse(program.prerequisites || "[]"),
        learningObjectives: JSON.parse(program.learningObjectives || "[]"),
        materialsProvided: JSON.parse(program.materialsProvided || "[]"),
        instructorName: `${program.instructor.firstName} ${program.instructor.lastName}`,
        participants: {
          total: totalEnrollments,
          active: activeEnrollments,
          completed: completedEnrollments,
          droppedOut:
            totalEnrollments - activeEnrollments - completedEnrollments,
          averageProgress,
          utilizationRate:
            Math.round((totalEnrollments / program.maxParticipants) * 10000) /
            100,
          spotsRemaining: Math.max(
            0,
            program.maxParticipants - totalEnrollments,
          ),
        },
        enrollmentList: program.enrollments.map((enrollment) => ({
          ...enrollment,
          clientName: `${enrollment.client.firstName} ${enrollment.client.lastName}`,
        })),
      };

      return NextResponse.json(
        { data: programWithParticipants },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_PROGRAM_PARTICIPANTS_GET]", {
        error,
        programId: programIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch program participants" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
