import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let taskIdForLog = "";
    try {
      const { id } = await params;
      taskIdForLog = id;

      const task = await prisma.creativeTask.findFirst({
        where: { id, storeId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          timesheets: {
            where: { storeId },
            select: {
              id: true,
              hours: true,
              date: true,
              description: true,
            },
            orderBy: { date: "desc" },
          },
        },
      });

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const totalTimeLogged = task.timesheets.reduce(
        (sum, ts) => sum + ts.hours,
        0,
      );
      const progress =
        task.estimatedHours > 0
          ? Math.min((totalTimeLogged / task.estimatedHours) * 100, 100)
          : 0;

      const taskWithDetails = {
        ...task,
        metrics: {
          timeLogged: totalTimeLogged,
          estimatedHours: task.estimatedHours,
          progress: Math.round(progress),
          timesheetCount: task.timesheets.length,
          isOverBudget: totalTimeLogged > task.estimatedHours,
          remainingHours: Math.max(0, task.estimatedHours - totalTimeLogged),
        },
      };

      return NextResponse.json(
        { data: taskWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_TASK_GET]", { error, taskId: taskIdForLog });
      return NextResponse.json(
        { error: "Failed to fetch task" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
