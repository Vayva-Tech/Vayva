import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30d';
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get Stripe payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(now.getTime() / 1000),
      },
      limit: 100,
    });

    // Calculate revenue metrics
    const totalRevenue = paymentIntents.data.reduce((sum, intent) => sum + intent.amount, 0) / 100;
    const totalOrders = paymentIntents.data.length;
    
    // Mock COGS (typically 30-40% for retail)
    const cogs = totalRevenue * 0.35;
    const grossProfit = totalRevenue - cogs;
    
    // Mock operating expenses
    const operatingExpenses = totalRevenue * 0.25;
    const netProfit = grossProfit - operatingExpenses;
    
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Mock CLV calculation (AOV × Purchase Frequency × Avg Customer Lifespan)
    const customerLifetimeValue = avgOrderValue * 3.5 * 2; // 3.5 purchases/year, 2 years lifespan
    
    // Mock refund rate (typically 5-15% for e-commerce)
    const refundRate = 0.08;

    // Revenue trend data (daily)
    const dailyRevenue = [];
    for (let i = 0; i < (timeRange === '1y' ? 12 : timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(Math.random() * 5000) + 2000,
      });
    }

    // Revenue breakdown by category
    const revenueBreakdown = [
      { category: 'New Arrivals', amount: totalRevenue * 0.35, percentage: 0.35, growth: 0.15 },
      { category: 'Best Sellers', amount: totalRevenue * 0.30, percentage: 0.30, growth: 0.08 },
      { category: 'Accessories', amount: totalRevenue * 0.20, percentage: 0.20, growth: 0.12 },
      { category: 'Sale', amount: totalRevenue * 0.15, percentage: 0.15, growth: -0.05 },
    ];

    return NextResponse.json({
      metrics: {
        totalRevenue,
        grossProfit,
        netProfit,
        profitMargin,
        averageOrderValue: avgOrderValue,
        customerLifetimeValue,
        refundRate,
      },
      revenueTrend: dailyRevenue,
      revenueBreakdown,
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
