import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/retail/stores/:id/performance-history
 * Get store performance trend data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    const now = new Date();
    const daysMap: Record<string, number> = { 
      '7d': 7, '14d': 14, '30d': 30, '90d': 90, '1y': 365 
    };
    const days = daysMap[period] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get daily sales data for the store
    const orders = await prisma.order.findMany({
      where: {
        businessId: session.user.id,
        storeId: params.id,
        createdAt: { gte: startDate },
        status: 'completed',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Aggregate by day
    const dailySales: Record<string, { sales: number; orders: number }> = {};
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { sales: 0, orders: 0 };
      }
      dailySales[date].sales += order.total;
      dailySales[date].orders += 1;
    });

    // Convert to array and calculate trends
    const history = Object.entries(dailySales)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        sales: Math.round(data.sales * 100) / 100,
        orders: data.orders,
        averageOrderValue: Math.round((data.sales / data.orders) * 100) / 100,
      }));

    // Calculate summary metrics
    const totalSales = history.reduce((sum, day) => sum + day.sales, 0);
    const totalOrders = history.reduce((sum, day) => sum + day.orders, 0);
    const avgDailySales = totalSales / history.length;
    const avgDailyOrders = totalOrders / history.length;

    // Calculate growth rate (comparing first half vs second half)
    const midpoint = Math.floor(history.length / 2);
    const firstHalfAvg = history.slice(0, midpoint).reduce((sum, day) => sum + day.sales, 0) / midpoint;
    const secondHalfAvg = history.slice(midpoint).reduce((sum, day) => sum + day.sales, 0) / (history.length - midpoint);
    const growthRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    // Find best and worst days
    const bestDay = history.reduce((max, day) => day.sales > max.sales ? day : max, history[0]);
    const worstDay = history.reduce((min, day) => day.sales < min.sales ? day : min, history[0]);

    return NextResponse.json({
      success: true,
      data: {
        storeId: params.id,
        period: `${days} days`,
        summary: {
          totalSales: Math.round(totalSales * 100) / 100,
          totalOrders,
          avgDailySales: Math.round(avgDailySales * 100) / 100,
          avgDailyOrders: Math.round(avgDailyOrders * 100) / 100,
          growthRate: Math.round(growthRate * 100) / 100,
          bestDay,
          worstDay,
        },
        history,
        trends: {
          isGrowing: growthRate > 0,
          growthRate,
          consistency: calculateConsistency(history),
        },
      },
    });
  } catch (error) {
    console.error('Store performance history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store performance history' },
      { status: 500 }
    );
  }
}

function calculateConsistency(history: Array<{ sales: number }>): number {
  if (history.length < 2) return 100;
  
  const sales = history.map(day => day.sales);
  const avg = sales.reduce((sum, val) => sum + val, 0) / sales.length;
  const variance = sales.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / sales.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0; // Coefficient of variation
  
  // Lower CV = more consistent = higher score
  return Math.max(0, Math.min(100, 100 - cv));
}
