import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'month';
      const comparePeriod = searchParams.get('compare') === 'true';
      
      // Calculate date ranges
      const now = new Date();
      let startDate: Date, comparisonStartDate: Date, comparisonEndDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          comparisonStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
          break;
        case 'quarter':
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          comparisonStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
          comparisonEndDate = startDate;
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          comparisonStartDate = new Date(now.getFullYear() - 1, 0, 1);
          comparisonEndDate = startDate;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
      }

      // Fetch all required data in parallel
      const [
        currentCases,
        comparisonCases,
        currentClients,
        comparisonClients,
        currentMatters,
        currentTimesheets,
        currentBillableHours,
        topClients,
        practiceAreas,
      ] = await Promise.all([
        // Current period data
        prisma.professionalCase.findMany({
          where: {
            storeId,
            createdAt: { gte: startDate },
            status: { not: "archived" },
          },
          include: {
            client: { select: { id: true, companyName: true } },
            matters: { select: { id: true, status: true } },
          },
        }),
        
        // Comparison period data
        comparePeriod ? prisma.professionalCase.findMany({
          where: {
            storeId,
            createdAt: { gte: comparisonStartDate, lt: comparisonEndDate },
            status: { not: "archived" },
          },
        }) : Promise.resolve([]),
        
        prisma.professionalClient.count({
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
        }),
        
        comparePeriod ? prisma.professionalClient.count({
          where: {
            storeId,
            createdAt: { gte: comparisonStartDate, lt: comparisonEndDate },
          },
        }) : Promise.resolve(0),
        
        prisma.professionalMatter.count({
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
        }),
        
        prisma.professionalTimesheet.findMany({
          where: {
            storeId,
            date: { gte: startDate },
          },
          select: { hours: true, billable: true, hourlyRate: true },
        }),
        
        prisma.professionalTimesheet.aggregate({
          where: {
            storeId,
            date: { gte: startDate },
            billable: true,
          },
          _sum: { hours: true },
        }),
        
        prisma.professionalClient.findMany({
          where: { storeId },
          include: {
            _count: {
              select: {
                cases: {
                  where: {
                    createdAt: { gte: startDate },
                    status: { not: "archived" },
                  },
                },
              },
            },
            cases: {
              where: {
                createdAt: { gte: startDate },
                status: { not: "archived" },
              },
              select: { 
                matters: {
                  select: {
                    timesheets: {
                      select: { hours: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { cases: { _count: "desc" } },
          take: 10,
        }),
        
        prisma.professionalPracticeArea.findMany({
          where: { storeId },
          include: {
            cases: {
              where: {
                createdAt: { gte: startDate },
                status: { not: "archived" },
              },
              select: {
                id: true,
                budget: true,
                matters: {
                  select: {
                    id: true,
                    timesheets: {
                      select: { hours: true },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

      // Calculate metrics
      const totalBillableHours = currentBillableHours._sum.hours || 0;
      const totalHours = currentTimesheets.reduce((sum, ts) => sum + ts.hours, 0);
      const totalBillableValue = currentTimesheets
        .filter(ts => ts.billable)
        .reduce((sum, ts) => sum + (ts.hours * ts.hourlyRate), 0);
      
      const caseClosureRate = currentCases.length > 0
        ? (currentCases.filter(c => c.status === "closed").length / currentCases.length) * 100
        : 0;
      
      // Top performing clients
      const topClientsData = topClients.map(client => ({
        id: client.id,
        companyName: client.companyName,
        caseCount: client._count.cases,
        totalHours: client.cases
          .flatMap(c => c.matters)
          .flatMap(m => m.timesheets)
          .reduce((sum, ts) => sum + ts.hours, 0),
      }));
      
      // Practice areas performance
      const practiceAreaPerformance = practiceAreas.map(area => ({
        id: area.id,
        name: area.name,
        caseCount: area.cases.length,
        totalBudget: area.cases.reduce((sum, c) => sum + (c.budget || 0), 0),
        totalHours: area.cases
          .flatMap(c => c.matters)
          .flatMap(m => m.timesheets)
          .reduce((sum, ts) => sum + ts.hours, 0),
      }));

      const analyticsData = {
        overview: {
          cases: {
            current: currentCases.length,
            previous: comparisonCases.length,
            change: comparisonCases.length > 0 
              ? ((currentCases.length - comparisonCases.length) / comparisonCases.length) * 100
              : 0,
            closureRate: caseClosureRate,
          },
          clients: {
            current: currentClients,
            previous: comparisonClients,
            change: comparisonClients > 0 
              ? ((currentClients - comparisonClients) / comparisonClients) * 100
              : 0,
          },
          matters: {
            current: currentMatters,
            previous: 0, // Would need separate query for comparison
            change: 0,
          },
        },
        productivity: {
          totalHours,
          billableHours: totalBillableHours,
          nonBillableHours: totalHours - totalBillableHours,
          totalBillableValue,
          averageHourlyRate: totalBillableHours > 0 ? totalBillableValue / totalBillableHours : 0,
        },
        clients: {
          topPerformers: topClientsData,
        },
        practiceAreas: {
          performance: practiceAreaPerformance,
        },
        period: {
          current: {
            start: startDate.toISOString(),
            end: now.toISOString(),
          },
          comparison: comparePeriod ? {
            start: comparisonStartDate.toISOString(),
            end: comparisonEndDate.toISOString(),
          } : null,
        },
      };

      return NextResponse.json(
        { data: analyticsData },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_REPORTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch professional services reports" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);