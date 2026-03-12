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

    const client = await prisma.creativeClient.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: {
            projects: {
              where: { status: { not: "cancelled" } },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get client projects and performance metrics
    const projects = await prisma.creativeProject.findMany({
      where: { 
        clientId: id,
        status: { not: "cancelled" },
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === "completed").length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    const clientWithMetrics = {
      ...client,
      performance: {
        totalProjects,
        completedProjects,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
        totalBudget,
        averageProjectValue: totalProjects > 0 ? totalBudget / totalProjects : 0,
        activeProjects: projects.filter(p => p.status === "active").length,
      },
    };

    return NextResponse.json(
      { data: clientWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[CREATIVE_CLIENT_GET]", { error, clientId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}