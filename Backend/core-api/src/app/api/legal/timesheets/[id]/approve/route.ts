import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const POST = withVayvaAPI(
  PERMISSIONS.LEGAL_MANAGE,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let timesheetIdForLog = "";
    try {
      const { id } = await params;
      timesheetIdForLog = id;

      const timesheet = await prisma.legalTimesheet.findFirst({
        where: {
          id,
          storeId,
          status: "submitted",
        },
      });

      if (!timesheet) {
        return NextResponse.json(
          { error: "Timesheet not found or not in submitted status" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const updated = await prisma.legalTimesheet.updateMany({
        where: { id, storeId, status: "submitted" },
        data: { status: "approved" },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          { error: "Timesheet not found or not in submitted status" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const approvedTimesheet = await prisma.legalTimesheet.findFirst({
        where: { id, storeId },
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
              caseNumber: true,
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

      logger.info("[LEGAL_TIMESHEET_APPROVE]", {
        timesheetId: id,
        userId: timesheet.userId,
        hours: timesheet.hours,
        billable: timesheet.billable,
        activityType: timesheet.activityType,
      });

      return NextResponse.json(
        { data: approvedTimesheet },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_TIMESHEET_APPROVE]", {
        error,
        timesheetId: timesheetIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to approve timesheet" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
