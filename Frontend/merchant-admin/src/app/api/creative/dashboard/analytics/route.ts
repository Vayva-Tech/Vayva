import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/creative/dashboard/analytics
// Returns comprehensive dashboard analytics for Creative Agency
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    // Fetch comprehensive analytics data
    const [
      activeProjects,
      utilizationData,
      revenueMTD,
      projectsByStage,
      teamWorkload,
      timeEntries,
      projectFinancials,
    ] = await Promise.all([
      // Active Projects Count
      prisma.project.count({
        where: {
          storeId,
          status: { in: ['active', 'in_progress'] },
        },
      }),

      // Utilization Rate Calculation
      prisma.timeEntry.groupBy({
        by: ['userId'],
        where: {
          storeId,
          createdAt: {
            gte: new Date(new Date().setDate(1)), // Current month
          },
        },
        _sum: { duration: true },
      }),

      // Revenue MTD (Month-to-Date)
      prisma.invoice.aggregate({
        where: {
          storeId,
          status: 'paid',
          dueDate: {
            gte: new Date(new Date().setDate(1)),
          },
        },
        _sum: { totalAmount: true },
      }),

      // Projects by Stage
      prisma.project.groupBy({
        by: ['stage'],
        where: { storeId },
        _count: { id: true },
      }),

      // Team Workload
      prisma.teamMember.findMany({
        where: { storeId, isActive: true },
        include: {
          allocations: {
            where: {
              endDate: { gte: new Date() },
              startDate: { lte: new Date() },
            },
          },
        },
      }),

      // Weekly Time Entries Summary
      prisma.timeEntry.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        _sum: { duration: true },
        _count: { id: true },
      }),

      // Project Financials (Budget vs Actual)
      prisma.project.findMany({
        where: {
          storeId,
          status: { in: ['active', 'in_progress'] },
        },
        select: {
          id: true,
          name: true,
          budget: true,
          stage: true,
          _count: {
            select: { timeEntries: true },
          },
        },
      }),
    ]);

    // Calculate utilization rate
    const totalHoursLogged = utilizationData.reduce((sum, data) => sum + (data._sum.duration || 0), 0) / 60; // Convert minutes to hours
    const totalAvailableHours = utilizationData.length * 40 * 4; // Assuming 40hr week * 4 weeks
    const utilizationRate = totalAvailableHours > 0 ? (totalHoursLogged / totalAvailableHours) * 100 : 0;

    // Format projects by stage
    const stageCounts = projectsByStage.reduce((acc, stage) => {
      acc[stage.stage] = stage._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Format team workload
    const workloadSummary = teamWorkload.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      allocationCount: member.allocations.length,
      utilization: member.allocations.length > 0 ? 'high' : 'low',
    }));

    return NextResponse.json({
      analytics: {
        activeProjectsCount: activeProjects,
        utilizationRate: Math.round(utilizationRate),
        revenueMTD: revenueMTD._sum.totalAmount || 0,
        projectsByStage: stageCounts,
        teamWorkload: workloadSummary,
        weeklyHoursBilled: (timeEntries._sum.duration || 0) / 60, // Convert to hours
        projectMargins: projectFinancials.map((p) => ({
          projectId: p.id,
          projectName: p.name,
          budget: p.budget || 0,
          stage: p.stage,
          timeEntriesCount: p._count.timeEntries,
        })),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch creative dashboard analytics', message: errorMessage },
      { status: 500 }
    );
  }
}
