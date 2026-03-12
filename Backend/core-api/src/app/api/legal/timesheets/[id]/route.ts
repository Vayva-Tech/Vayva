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
        { status: 404, headers: standardHeaders(requestId) }
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[LEGAL_TIMESHEET_GET]", { error, timesheetId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch timesheet" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}