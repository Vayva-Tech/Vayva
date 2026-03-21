import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { prisma } from "@vayva/db";
import { z } from "zod";

const ScheduleReportSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["orders", "inventory", "customers", "sales", "performance"]),
  format: z.enum(["csv", "pdf", "excel"]),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  email: z.string().email(),
  recipients: z.array(z.string().email()).optional(),
  filters: z.record(z.any()).optional(),
  columns: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
});

// GET /api/retail/reports/schedule - Get scheduled reports
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const reports = await prisma.scheduledReport.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        {
          success: true,
          data: { reports },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Get scheduled reports error:", error);
      return NextResponse.json(
        { error: "Failed to fetch scheduled reports" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// POST /api/retail/reports/schedule - Create scheduled report
export const POST = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const body = await req.json();
      const result = ScheduleReportSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const {
        name,
        type,
        format,
        frequency,
        email,
        recipients = [],
        filters,
        columns,
        enabled,
      } = result.data;

      // Calculate next run time
      const nextRunAt = calculateNextRun(frequency);

      // Create scheduled report
      const report = await prisma.scheduledReport.create({
        data: {
          storeId,
          name,
          type,
          format,
          frequency,
          email,
          recipients,
          filters: filters || {},
          columns: columns || [],
          enabled,
          nextRunAt,
          lastRunAt: null,
          lastStatus: "pending",
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Report scheduled successfully",
          data: { report },
        },
        { status: 201, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Schedule report error:", error);
      return NextResponse.json(
        { error: "Failed to schedule report" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// DELETE /api/retail/reports/schedule - Cancel scheduled report
export const DELETE = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const { searchParams } = new URL(req.url);
      const reportId = searchParams.get("id");

      if (!reportId) {
        return NextResponse.json(
          { error: "Report ID required" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      await prisma.scheduledReport.delete({
        where: {
          id: reportId,
          storeId, // Ensure ownership
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Report cancelled successfully",
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Cancel report error:", error);
      return NextResponse.json(
        { error: "Failed to cancel report" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// PUT /api/retail/reports/schedule - Update scheduled report
export const PUT = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const { searchParams } = new URL(req.url);
      const reportId = searchParams.get("id");

      if (!reportId) {
        return NextResponse.json(
          { error: "Report ID required" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const body = await req.json();
      const updates = ScheduleReportSchema.partial().parse(body);

      const report = await prisma.scheduledReport.update({
        where: {
          id: reportId,
          storeId,
        },
        data: {
          ...updates,
          nextRunAt: updates.frequency ? calculateNextRun(updates.frequency) : undefined,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Report updated successfully",
          data: { report },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Update report error:", error);
      return NextResponse.json(
        { error: "Failed to update report" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// Helper function to calculate next run time
function calculateNextRun(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case "daily":
      // Tomorrow at 8 AM
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0);
      break;
    
    case "weekly": {
      // Next Monday at 8 AM
      const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
      now.setDate(now.getDate() + daysUntilMonday);
      now.setHours(8, 0, 0, 0);
      break;
    }
    
    case "monthly":
      // 1st of next month at 8 AM
      now.setMonth(now.getMonth() + 1);
      now.setDate(1);
      now.setHours(8, 0, 0, 0);
      break;
    
    case "quarterly": {
      // 1st of next quarter at 8 AM
      const currentMonth = now.getMonth();
      const nextQuarterMonth = Math.floor(currentMonth / 3) * 3 + 3;
      now.setMonth(nextQuarterMonth);
      now.setDate(1);
      now.setHours(8, 0, 0, 0);
      break;
    }
  }

  return now;
}
