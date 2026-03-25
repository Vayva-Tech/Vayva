import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { getLegalDashboardConfig } from "@vayva/industry-legal/dashboard";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/dashboard
 * Get comprehensive legal dashboard data
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      
      // Get dashboard configuration
      const dashboardConfig = await getLegalDashboardConfig(storeId);
      
      // Fetch real data from database
      const [
        activeCases,
        timeEntries,
        trustAccounts,
        deadlines,
        _documents,
        courtAppearances,
      ] = await Promise.all([
        prisma.case.findMany({
          where: { storeId, status: 'active' },
          include: { practiceArea: true },
        }),
        prisma.timeEntry.findMany({
          where: { case: { storeId } },
          include: { case: true },
        }),
        prisma.trustAccount.findMany({
          where: { storeId, isActive: true },
          include: { clientLedgers: true },
        }),
        prisma.deadline.findMany({
          where: { case: { storeId }, status: 'pending' },
          orderBy: { dueDate: 'asc' },
        }),
        prisma.legalDocument.findMany({
          where: { case: { storeId } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.courtAppearance.findMany({
          where: { 
            case: { storeId },
            dateTime: { gte: new Date() },
          },
          orderBy: { dateTime: 'asc' },
        }),
      ]);

      // Calculate firm performance metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const activeCasesCount = activeCases.length;
      const newCasesThisWeek = activeCases.filter(c => c.createdAt >= startOfWeek).length;
      const closedThisMonth = await prisma.case.count({
        where: {
          storeId,
          status: 'closed',
          closedDate: { gte: startOfMonth },
        },
      });

      // Calculate billable hours MTD
      const billableHoursMTD = timeEntries
        .filter(t => t.date >= startOfMonth && t.category === 'billable')
        .reduce((sum, t) => sum + t.duration, 0);

      // Calculate collections MTD
      const collectionsMTD = activeCases.reduce((sum, c) => sum + c.amountCollected, 0);

      // Build response
      const response = {
        ...dashboardConfig,
        firmPerformance: {
          ...dashboardConfig.firmPerformance,
          activeCases: activeCasesCount,
          newCasesThisWeek: newCasesThisWeek,
          closedThisMonth: closedThisMonth,
          billableHoursMTD,
          collectionsMTD,
        },
        casePipeline: {
          ...dashboardConfig.casePipeline,
          casesByPracticeArea: await getCasesByPracticeArea(storeId),
          pendingIntake: await prisma.intakeQuestionnaire.count({
            where: { storeId, status: 'new' },
          }),
          conflictsPending: await prisma.conflictCheck.count({
            where: { storeId, status: 'pending' },
          }),
        },
        courtCalendar: {
          todaysAppearances: courtAppearances.filter(
            a => a.dateTime.toDateString() === now.toDateString()
          ),
          upcomingHearings: courtAppearances.slice(0, 10),
        },
        timeTracking: {
          ...dashboardConfig.timeTracking,
          billedHours: timeEntries.filter(t => t.status === 'invoiced').reduce((sum, t) => sum + t.duration, 0),
          wipHours: timeEntries.filter(t => ['submitted', 'approved'].includes(t.status)).reduce((sum, t) => sum + t.duration, 0),
        },
        trustAccount: {
          totalBalance: trustAccounts.reduce((sum, a) => sum + a.currentBalance, 0),
          clientBalances: trustAccounts.flatMap(a => 
            a.clientLedgers.map(l => ({
              clientName: l.clientName,
              balance: l.balance,
              caseNumber: l.caseNumber,
            }))
          ),
        },
        criticalDeadlines: {
          todaysDeadlines: deadlines.filter(
            d => d.dueDate.toDateString() === now.toDateString()
          ),
          upcomingDeadlines: deadlines.slice(0, 10),
        },
        lastUpdated: new Date(),
      };

      return NextResponse.json({ success: true, data: response });
    } catch (error) {
      logger.error('[LEGAL_DASHBOARD_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load legal dashboard' },
        { status: 500 }
      );
    }
  }
);

// Helper function - should be imported from services in production
async function getCasesByPracticeArea(storeId: string) {
  const cases = await prisma.case.findMany({
    where: { storeId, status: 'active' },
    include: { practiceArea: true },
  });

  const grouped = cases.reduce((acc, caseItem) => {
    const pa = caseItem.practiceArea;
    if (!acc[pa.code]) {
      acc[pa.code] = {
        practiceArea: pa.name,
        code: pa.code,
        count: 0,
        totalValue: 0,
      };
    }
    acc[pa.code].count++;
    if (caseItem.actualValue) {
      acc[pa.code].totalValue += caseItem.actualValue;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map((item: any) => ({
    ...item,
    percentage: Math.round((item.count / cases.length) * 100),
    avgValue: item.count > 0 ? item.totalValue / item.count : 0,
  }));
}
