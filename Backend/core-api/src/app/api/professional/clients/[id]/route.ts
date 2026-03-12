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

    const client = await prisma.professionalClient.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: {
            cases: {
              where: { status: { not: "archived" } },
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

    // Get client cases and performance metrics
    const cases = await prisma.professionalCase.findMany({
      where: { 
        clientId: id,
        status: { not: "archived" },
      },
      include: {
        _count: {
          select: {
            matters: true,
          },
        },
      },
    });

    const totalCases = cases.length;
    const closedCases = cases.filter(c => c.status === "closed").length;
    const totalBudget = cases.reduce((sum, c) => sum + (c.budget || 0), 0);
    
    const clientWithMetrics = {
      ...client,
      performance: {
        totalCases,
        closedCases,
        closureRate: totalCases > 0 ? (closedCases / totalCases) * 100 : 0,
        totalBudget,
        averageCaseValue: totalCases > 0 ? totalBudget / totalCases : 0,
        activeCases: cases.filter(c => c.status === "open" || c.status === "in_progress").length,
      },
    };

    return NextResponse.json(
      { data: clientWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_CLIENT_GET]", { error, clientId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}