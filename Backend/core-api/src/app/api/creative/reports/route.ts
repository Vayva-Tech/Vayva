import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
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
        case 'quarter': {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          comparisonStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
          comparisonEndDate = startDate;
          break;
        }
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
        currentProjects,
        comparisonProjects,
        currentClients,
        comparisonClients,
        currentTasks,
        currentTimesheets,
        currentInvoices,
        comparisonInvoices,
        topClients,
        projectCategories,
      ] = await Promise.all([
        // Current period data
        prisma.creativeProject.findMany({
          where: {
            storeId,
            createdAt: { gte: startDate },
            status: { not: "cancelled" },
          },
          include: {
            client: { select: { id: true, companyName: true } },
            tasks: { 
              select: { 
                id: true, 
                status: true, 
                estimatedHours: true 
              } 
            },
          },
        }),
        
        // Comparison period data
        comparePeriod ? prisma.creativeProject.findMany({
          where: {
            storeId,
            createdAt: { gte: comparisonStartDate, lt: comparisonEndDate },
            status: { not: "cancelled" },
          },
        }) : Promise.resolve([]),
        
        prisma.creativeClient.count({
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
        }),
        
        comparePeriod ? prisma.creativeClient.count({
          where: {
            storeId,
            createdAt: { gte: comparisonStartDate, lt: comparisonEndDate },
          },
        }) : Promise.resolve(0),
        
        prisma.creativeTask.count({
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
        }),
        
        prisma.creativeTimesheet.findMany({
          where: {
            storeId,
            date: { gte: startDate },
          },
          select: { hours: true, billable: true, hourlyRate: true },
        }),
        
        prisma.creativeInvoice.findMany({
          where: {
            storeId,
            invoiceDate: { gte: startDate },
            status: { not: "cancelled" },
          },
          select: { totalAmount: true, status: true },
        }),
        
        comparePeriod ? prisma.creativeInvoice.findMany({
          where: {
            storeId,
            invoiceDate: { gte: comparisonStartDate, lt: comparisonEndDate },
            status: { not: "cancelled" },
          },
          select: { totalAmount: true },
        }) : Promise.resolve([]),
        
        prisma.creativeClient.findMany({
          where: { storeId },
          include: {
            _count: {
              select: {
                projects: {
                  where: {
                    createdAt: { gte: startDate },
                    status: { not: "cancelled" },
                  },
                },
              },
            },
            projects: {
              where: {
                createdAt: { gte: startDate },
                status: { not: "cancelled" },
              },
              select: { 
                tasks: {
                  select: {
                    timesheets: {
                      select: { hours: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { projects: { _count: "desc" } },
          take: 10,
        }),
        
        prisma.creativeCategory.findMany({
          where: { storeId },
          include: {
            projects: {
              where: {
                createdAt: { gte: startDate },
                status: { not: "cancelled" },
              },
              select: {
                id: true,
                budget: true,
                tasks: {
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
      const currentRevenue = currentInvoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      const comparisonRevenue = comparisonInvoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      const totalBillableHours = currentTimesheets
        .filter(ts => ts.billable)
        .reduce((sum, ts) => sum + ts.hours, 0);
      
      const totalBillableValue = currentTimesheets
        .filter(ts => ts.billable)
        .reduce((sum, ts) => sum + (ts.hours * ts.hourlyRate), 0);
      
      const projectCompletionRate = currentProjects.length > 0
        ? (currentProjects.filter(p => p.status === "completed").length / currentProjects.length) * 100
        : 0;
      
      // Top performing clients
      const topClientsData = topClients.map(client => ({
        id: client.id,
        companyName: client.companyName,
        projectCount: client._count.projects,
        totalHours: client.projects
          .flatMap(p => p.tasks)
          .flatMap(t => t.timesheets)
          .reduce((sum, ts) => sum + ts.hours, 0),
      }));
      
      // Project categories performance
      const categoryPerformance = projectCategories.map(category => ({
        id: category.id,
        name: category.name,
        projectCount: category.projects.length,
        totalBudget: category.projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalHours: category.projects
          .flatMap(p => p.tasks)
          .flatMap(t => t.timesheets)
          .reduce((sum, ts) => sum + ts.hours, 0),
      }));

      const analyticsData = {
        overview: {
          revenue: {
            current: currentRevenue,
            previous: comparisonRevenue,
            change: comparisonRevenue > 0 
              ? ((currentRevenue - comparisonRevenue) / comparisonRevenue) * 100
              : 0,
          },
          projects: {
            current: currentProjects.length,
            previous: comparisonProjects.length,
            change: comparisonProjects.length > 0 
              ? ((currentProjects.length - comparisonProjects.length) / comparisonProjects.length) * 100
              : 0,
            completionRate: projectCompletionRate,
          },
          clients: {
            current: currentClients,
            previous: comparisonClients,
            change: comparisonClients > 0 
              ? ((currentClients - comparisonClients) / comparisonClients) * 100
              : 0,
          },
        },
        productivity: {
          totalTasks: currentTasks,
          totalBillableHours,
          totalBillableValue,
          averageHourlyRate: totalBillableHours > 0 ? totalBillableValue / totalBillableHours : 0,
        },
        clients: {
          topPerformers: topClientsData,
        },
        categories: {
          performance: categoryPerformance,
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
      logger.error("[CREATIVE_REPORTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch creative reports" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);