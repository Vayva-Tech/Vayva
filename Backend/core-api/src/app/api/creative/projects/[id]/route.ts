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
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate project metrics
    const totalTimeLogged = await prisma.creativeTimesheet.aggregate({
      where: { taskId: { in: project.tasks.map(t => t.id) } },
      _sum: { hours: true },
    });

    const totalTaskValue = project.tasks.reduce((sum, task) => sum + (task.estimatedHours * 50), 0); // Assuming $50/hour
    
    const projectWithDetails = {
      ...project,
      metrics: {
        totalTimeLogged: totalTimeLogged._sum.hours || 0,
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter(t => t.status === "completed").length,
        taskCompletionRate: project.tasks.length > 0 
          ? (project.tasks.filter(t => t.status === "completed").length / project.tasks.length) * 100
          : 0,
        estimatedValue: totalTaskValue,
        progress: project.status === "completed" ? 100 : 
                 project.status === "active" ? 75 :
                 project.status === "planning" ? 25 : 0,
      },
    };

    return NextResponse.json(
      { data: projectWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[CREATIVE_PROJECT_GET]", { error, projectId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}