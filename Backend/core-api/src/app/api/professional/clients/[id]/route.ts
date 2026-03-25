import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let clientIdForLog = "";
    try {
      const { id } = await params;
      clientIdForLog = id;

      const client = await prisma.professionalClient.findFirst({
        where: { id, storeId },
        include: {
          _count: {
            select: {
              cases: {
                where: { storeId, status: { not: "archived" } },
              },
            },
          },
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const cases = await prisma.professionalCase.findMany({
        where: {
          clientId: id,
          storeId,
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
      const closedCases = cases.filter((c) => c.status === "closed").length;
      const totalBudget = cases.reduce((sum, c) => sum + (c.budget || 0), 0);

      const clientWithMetrics = {
        ...client,
        performance: {
          totalCases,
          closedCases,
          closureRate: totalCases > 0 ? (closedCases / totalCases) * 100 : 0,
          totalBudget,
          averageCaseValue: totalCases > 0 ? totalBudget / totalCases : 0,
          activeCases: cases.filter(
            (c) => c.status === "open" || c.status === "in_progress",
          ).length,
        },
      };

      return NextResponse.json(
        { data: clientWithMetrics },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CLIENT_GET]", {
        error,
        clientId: clientIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch client" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
