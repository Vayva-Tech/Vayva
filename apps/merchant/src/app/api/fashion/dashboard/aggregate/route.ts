import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';
import { aiRecommendationEngine } from '@vayva/industry-fashion';

/**
 * GET /api/fashion/dashboard/aggregate
 * Returns aggregate metrics for the fashion dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get orders for the period
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Calculate metrics
    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const gmv = revenue; // For fashion, GMV typically equals revenue
    const totalOrders = orders.length;
    
    // Get unique customers
    const customerIds = new Set(orders.map((o) => o.customerId));
    const totalCustomers = customerIds.size;

    // Calculate conversion rate (orders / sessions)
    // TODO: Integrate with analytics service for session data
    const conversionRate = totalOrders / 1000; // Placeholder

    // Generate sparkline data (last 14 days)
    const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      const dayOrders = orders.filter(
        (o) => o.createdAt.toDateString() === day.toDateString()
      );
      return dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    });

    // Get AI recommendations (if Pro tier)
    // TODO: Check actual plan tier from store subscription
    const isProTier = true; // Placeholder
    const aiRecommendations = isProTier
      ? await aiRecommendationEngine.getAllRecommendations(storeId)
      : [];

    return NextResponse.json({
      kpis: [
        {
          id: 'revenue',
          name: 'revenue',
          value: revenue,
          change: 0.124, // 12.4% - TODO: Calculate from previous period
          sparklineData: dailyRevenue,
        },
        {
          id: 'gmv',
          name: 'gmv',
          value: gmv,
          change: 0.087, // 8.7%
          sparklineData: dailyRevenue.map((v) => v * 0.95),
        },
        {
          id: 'orders',
          name: 'orders',
          value: totalOrders,
          change: 0.152, // 15.2%
          sparklineData: Array.from({ length: 14 }, () => Math.floor(Math.random() * 20) + 5),
        },
        {
          id: 'customers',
          name: 'customers',
          value: totalCustomers,
          change: 0.221, // 22.1%
          sparklineData: Array.from({ length: 14 }, () => Math.floor(Math.random() * 50) + 20),
        },
        {
          id: 'conversion',
          name: 'conversion',
          value: conversionRate,
          change: 0.004, // 0.4%
          sparklineData: Array.from({ length: 14 }, () => Math.random() * 0.05 + 0.02),
        },
      ],
      aiRecommendations: aiRecommendations.slice(0, 3), // Return top 3 recommendations
    });
  } catch (error) {
    console.error('Error fetching dashboard aggregate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
