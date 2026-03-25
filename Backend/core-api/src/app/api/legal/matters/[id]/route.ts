import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let matterIdForLog = "";
    try {
      const { id } = await params;
      matterIdForLog = id;

      const matter = await prisma.legalMatter.findFirst({
        where: { id, storeId },
        include: {
          case: {
            select: {
              id: true,
              name: true,
              caseNumber: true,
              client: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          dockets: {
            where: { storeId },
            select: {
              id: true,
              filingDate: true,
              description: true,
            },
            orderBy: { filingDate: "desc" },
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

      if (!matter) {
        return NextResponse.json(
          { error: "Matter not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const totalTimeLogged = matter.timesheets.reduce(
        (sum, ts) => sum + ts.hours,
        0,
      );
      const progress =
        matter.estimatedHours && matter.estimatedHours > 0
          ? Math.min((totalTimeLogged / matter.estimatedHours) * 100, 100)
          : 0;

      const matterWithDetails = {
        ...matter,
        metrics: {
          timeLogged: totalTimeLogged,
          estimatedHours: matter.estimatedHours || 0,
          progress: Math.round(progress),
          docketCount: matter.dockets.length,
          timesheetCount: matter.timesheets.length,
          remainingHours: matter.estimatedHours
            ? Math.max(0, matter.estimatedHours - totalTimeLogged)
            : 0,
          daysUntilDue: Math.ceil(
            (new Date(matter.dueDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        },
      };

      return NextResponse.json(
        { data: matterWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_MATTER_GET]", { error, matterId: matterIdForLog });
      return NextResponse.json(
        { error: "Failed to fetch matter" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
