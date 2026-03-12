import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/legal/reports/workload
 * Attorney workload analysis report
 */
export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_REPORTS_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const searchParams = request.nextUrl.searchParams;
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (!startDate || !endDate) {
        return NextResponse.json(
          { success: false, error: "Date range required" },
          { status: 400 }
        );
      }

      const dateRange = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };

      // Fetch time entries grouped by attorney
      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          case: { storeId },
          createdAt: dateRange,
        },
        include: {
          attorney: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          case: {
            select: {
              title: true,
              practiceAreaId: true,
            },
          },
        },
      });

      // Aggregate by attorney
      const workloadByAttorney = timeEntries.reduce((acc, entry) => {
        const attorneyId = entry.attorneyId;
        if (!acc[attorneyId]) {
          acc[attorneyId] = {
            attorney: entry.attorney,
            totalHours: 0,
            billableHours: 0,
            nonBillableHours: 0,
            cases: new Set(),
            entries: [],
          };
        }

        acc[attorneyId].totalHours += entry.hours;
        if (entry.isBillable) {
          acc[attorneyId].billableHours += entry.hours;
        } else {
          acc[attorneyId].nonBillableHours += entry.hours;
        }
        acc[attorneyId].cases.add(entry.caseId);
        acc[attorneyId].entries.push(entry);

        return acc;
      }, {} as any);

      // Convert to array and calculate utilization
      const workload = Object.values(workloadByAttorney).map((data: any) => {
        const utilizationRate =
          data.totalHours > 0 ? (data.billableHours / data.totalHours) * 100 : 0;

        return {
          attorney: data.attorney,
          totalHours: parseFloat(data.totalHours.toFixed(2)),
          billableHours: parseFloat(data.billableHours.toFixed(2)),
          nonBillableHours: parseFloat(data.nonBillableHours.toFixed(2)),
          utilizationRate: parseFloat(utilizationRate.toFixed(2)),
          activeCases: data.cases.size,
          avgHoursPerCase: parseFloat(
            (data.totalHours / data.cases.size).toFixed(2)
          ),
        };
      });

      // Sort by total hours
      workload.sort((a, b) => b.totalHours - a.totalHours);

      return NextResponse.json({
        success: true,
        data: {
          period: { startDate, endDate },
          workload,
          summary: {
            totalAttorneys: workload.length,
            averageUtilization:
              workload.length > 0
                ? parseFloat(
                    (
                      workload.reduce((sum, w) => sum + w.utilizationRate, 0) /
                      workload.length
                    ).toFixed(2)
                  )
                : 0,
            totalHours: workload.reduce((sum, w) => sum + w.totalHours, 0),
          },
        },
      });
    } catch (error) {
      console.error("Error generating workload report:", error);
      return NextResponse.json(
        { success: false, error: "Failed to generate workload report" },
        { status: 500 }
      );
    }
  }
);
