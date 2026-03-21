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
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get Stripe payment intents for revenue data
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
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Mock marketing spend data (in production, fetch from ad platforms)
    const marketingData = [
      { channel: 'facebook', spend: 5000, revenue: 20000 },
      { channel: 'instagram', spend: 3000, revenue: 15000 },
      { channel: 'google', spend: 4000, revenue: 18000 },
      { channel: 'email', spend: 500, revenue: 8000 },
    ];

    // Calculate ROAS for each channel
    const campaigns = marketingData.map((data) => ({
      campaignId: `camp-${data.channel}`,
      campaignName: `${data.channel.charAt(0).toUpperCase() + data.channel.slice(1)} Ads`,
      channel: data.channel,
      spend: data.spend,
      revenue: data.revenue,
      roas: data.revenue / data.spend,
      orders: Math.round(data.revenue / avgOrderValue) || 0,
      cpa: data.spend / (Math.round(data.revenue / avgOrderValue) || 1),
      ctr: 0.02 + Math.random() * 0.03, // Mock CTR 2-5%
      conversionRate: 0.02 + Math.random() * 0.03, // Mock conversion rate 2-5%
    }));

    return NextResponse.json({
      campaigns,
      summary: {
        totalSpend: campaigns.reduce((sum, c) => sum + c.spend, 0),
        totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
        avgROAS: campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length,
        netProfit: campaigns.reduce((sum, c) => sum + (c.revenue - c.spend), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching ROAS data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ROAS data' },
      { status: 500 }
    );
  }
}
