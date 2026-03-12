import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify timesheet exists and is submitted
    const timesheet = await prisma.professionalTimesheet.findFirst({
      where: { 
        id,
        storeId,
        status: "submitted",
      },
    });

    if (!timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found or not in submitted status" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Update timesheet status to approved
    const approvedTimesheet = await prisma.professionalTimesheet.update({
      where: { id },
      data: { status: "approved" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        case: {
          select: {
            name: true,
            client: {
              select: {
                companyName: true,
              },
            },
          },
        },
        matter: {
          select: {
            name: true,
          },
        },
      },
    });

    logger.info("[PROFESSIONAL_TIMESHEET_APPROVE]", {
      timesheetId: id,
      userId: timesheet.userId,
      hours: timesheet.hours,
      billable: timesheet.billable,
    });

    return NextResponse.json(
      { data: approvedTimesheet },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_TIMESHEET_APPROVE]", { error, timesheetId: params.id });
    return NextResponse.json(
      { error: "Failed to approve timesheet" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}