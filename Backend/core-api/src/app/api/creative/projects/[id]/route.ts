import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let projectIdForLog = "";
    try {
      const { id } = await params;
      projectIdForLog = id;

      const project = await prisma.creativeProject.findFirst({
        where: { id, storeId },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          projectManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          tasks: {
            where: { storeId },
            select: {
              id: true,
              name: true,
              status: true,
              priority: true,
              estimatedHours: true,
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const taskIds = project.tasks.map((t) => t.id);
      const totalTimeLogged =
        taskIds.length > 0
          ? await prisma.creativeTimesheet.aggregate({
              where: { taskId: { in: taskIds }, storeId },
              _sum: { hours: true },
            })
          : { _sum: { hours: null as number | null } };

      const totalTaskValue = project.tasks.reduce(
        (sum, task) => sum + task.estimatedHours * 50,
        0,
      );

      const projectWithDetails = {
        ...project,
        metrics: {
          totalTimeLogged: totalTimeLogged._sum.hours || 0,
          totalTasks: project.tasks.length,
          completedTasks: project.tasks.filter((t) => t.status === "completed")
            .length,
          taskCompletionRate:
            project.tasks.length > 0
              ? (project.tasks.filter((t) => t.status === "completed").length /
                  project.tasks.length) *
                100
              : 0,
          estimatedValue: totalTaskValue,
          progress:
            project.status === "completed"
              ? 100
              : project.status === "active"
                ? 75
                : project.status === "planning"
                  ? 25
                  : 0,
        },
      };

      return NextResponse.json(
        { data: projectWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_PROJECT_GET]", {
        error,
        projectId: projectIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch project" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
