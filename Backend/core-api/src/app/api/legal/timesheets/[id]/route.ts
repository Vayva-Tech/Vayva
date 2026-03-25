import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let timesheetIdForLog = "";
    try {
      const { id } = await params;
      timesheetIdForLog = id;

      const timesheet = await prisma.legalTimesheet.findFirst({
        where: { id, storeId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
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
          matter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!timesheet) {
        return NextResponse.json(
          { error: "Timesheet not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const timesheetWithDetails = {
        ...timesheet,
        value: timesheet.hours * timesheet.hourlyRate,
        clientName: timesheet.case?.client.companyName,
        caseName: timesheet.case?.name,
        caseNumber: timesheet.case?.caseNumber,
        matterName: timesheet.matter?.name,
      };

      return NextResponse.json(
        { data: timesheetWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_TIMESHEET_GET]", {
        error,
        timesheetId: timesheetIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch timesheet" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
