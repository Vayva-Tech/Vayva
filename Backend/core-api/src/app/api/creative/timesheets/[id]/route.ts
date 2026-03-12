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

    const timesheet = await prisma.creativeTimesheet.findFirst({
      where: { id, storeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
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
      projectName: timesheet.task.project.name,
      clientName: timesheet.task.project.client.companyName,
    };

    return NextResponse.json(
      { data: timesheetWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[CREATIVE_TIMESHEET_GET]", { error, timesheetId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch timesheet" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}