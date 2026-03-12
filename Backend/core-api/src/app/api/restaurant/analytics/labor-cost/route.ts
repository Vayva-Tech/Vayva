import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/restaurant/analytics/labor-cost
 * Get labor cost analytics and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    // Get all time clock records for the period
    const timeClocks = await prisma.staffTimeClock.findMany({
      where: {
        businessId: session.user.id,
        clockInTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            hourlyRate: true,
          },
        },
      },
    });

    // Calculate labor metrics
    const laborMetrics = timeClocks.map((clock) => {
      const clockOut = clock.clockOutTime || new Date();
      const hoursWorked = (clockOut.getTime() - clock.clockInTime.getTime()) / (1000 * 60 * 60);
      const laborCost = hoursWorked * clock.staff.hourlyRate;

      return {
        date: clock.clockInTime.toISOString().split('T')[0],
        staffId: clock.staffId,
        staffName: clock.staff.name,
        role: clock.staff.role,
        hoursWorked,
        hourlyRate: clock.staff.hourlyRate,
        laborCost,
        shiftType: clock.shiftType,
      };
    });

    // Aggregate by date
    const dailyMetrics: Record<string, {
      totalHours: number;
      totalCost: number;
      staffCount: number;
    }> = {};

    laborMetrics.forEach((metric) => {
      if (!dailyMetrics[metric.date]) {
        dailyMetrics[metric.date] = {
          totalHours: 0,
          totalCost: 0,
          staffCount: 0,
        };
      }
      dailyMetrics[metric.date].totalHours += metric.hoursWorked;
      dailyMetrics[metric.date].totalCost += metric.laborCost;
      dailyMetrics[metric.date].staffCount += 1;
    });

    // Get sales data for the same period
    const orders = await prisma.order.findMany({
      where: {
        businessId: session.user.id,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: 'completed',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const dailySales: Record<string, number> = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + order.total;
    });

    // Calculate labor cost percentage
    const analytics = Object.entries(dailyMetrics).map(([date, metrics]) => {
      const sales = dailySales[date] || 0;
      const laborCostPercentage = sales > 0 ? (metrics.totalCost / sales) * 100 : 0;

      return {
        date,
        totalHours: Math.round(metrics.totalHours * 100) / 100,
        totalCost: Math.round(metrics.totalCost * 100) / 100,
        totalSales: Math.round(sales * 100) / 100,
        laborCostPercentage: Math.round(laborCostPercentage * 100) / 100,
        staffCount: metrics.staffCount,
      };
    });

    // Summary statistics
    const totalHours = analytics.reduce((sum, day) => sum + day.totalHours, 0);
    const totalCost = analytics.reduce((sum, day) => sum + day.totalCost, 0);
    const totalSales = analytics.reduce((sum, day) => sum + day.totalSales, 0);
    const avgLaborCostPercentage = totalSales > 0 ? (totalCost / totalSales) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalHours: Math.round(totalHours * 100) / 100,
          totalLaborCost: Math.round(totalCost * 100) / 100,
          totalSales: Math.round(totalSales * 100) / 100,
          avgLaborCostPercentage: Math.round(avgLaborCostPercentage * 100) / 100,
          daysAnalyzed: analytics.length,
        },
        dailyMetrics: analytics,
        breakdown: {
          byRole: groupByRole(laborMetrics),
          byShiftType: groupByShiftType(laborMetrics),
        },
      },
    });
  } catch (error) {
    console.error('Labor cost analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labor cost analytics' },
      { status: 500 }
    );
  }
}

function groupByRole(metrics: any[]) {
  const roles: Record<string, { hours: number; cost: number; count: number }> = {};
  
  metrics.forEach((metric) => {
    if (!roles[metric.role]) {
      roles[metric.role] = { hours: 0, cost: 0, count: 0 };
    }
    roles[metric.role].hours += metric.hoursWorked;
    roles[metric.role].cost += metric.laborCost;
    roles[metric.role].count += 1;
  });

  return Object.entries(roles).map(([role, data]) => ({
    role,
    totalHours: Math.round(data.hours * 100) / 100,
    totalCost: Math.round(data.cost * 100) / 100,
    avgHourlyRate: Math.round((data.cost / data.hours) * 100) / 100,
    staffCount: data.count,
  }));
}

function groupByShiftType(metrics: any[]) {
  const shifts: Record<string, { hours: number; cost: number }> = {};
  
  metrics.forEach((metric) => {
    if (!shifts[metric.shiftType]) {
      shifts[metric.shiftType] = { hours: 0, cost: 0 };
    }
    shifts[metric.shiftType].hours += metric.hoursWorked;
    shifts[metric.shiftType].cost += metric.laborCost;
  });

  return Object.entries(shifts).map(([shiftType, data]) => ({
    shiftType,
    totalHours: Math.round(data.hours * 100) / 100,
    totalCost: Math.round(data.cost * 100) / 100,
  }));
}
