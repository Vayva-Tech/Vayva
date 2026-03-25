import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/retail/customers/segments
 * Get customer segmentation data
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all customers with their order history
    const customers = await prisma.customer.findMany({
      where: { businessId: session.user.id },
      include: {
        orders: {
          select: {
            total: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    // Segment customers
    const segments = {
      vip: [] as any[],
      regular: [] as any[],
      occasional: [] as any[],
      atRisk: [] as any[],
      new: [] as any[],
    };

    const now = new Date();
    const _thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const _ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    customers.forEach(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const lastOrderDate = customer.orders.length > 0 
        ? customer.orders.reduce((latest, order) => 
            order.createdAt > latest ? order.createdAt : latest, 
            customer.orders[0].createdAt
          )
        : null;

      const daysSinceLastOrder = lastOrderDate 
        ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      const customerData = {
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        totalOrders,
        totalSpent: Math.round(totalSpent * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        lastOrderDate,
        daysSinceLastOrder,
      };

      // Segmentation logic
      if (totalOrders === 0) {
        segments.new.push(customerData);
      } else if (daysSinceLastOrder !== null && daysSinceLastOrder > 90) {
        segments.atRisk.push(customerData);
      } else if (totalOrders >= 10 || totalSpent >= 1000) {
        segments.vip.push(customerData);
      } else if (totalOrders >= 5 || totalSpent >= 500) {
        segments.regular.push(customerData);
      } else {
        segments.occasional.push(customerData);
      }
    });

    // Calculate segment metrics
    const segmentMetrics = Object.entries(segments).map(([segment, customers]) => ({
      segment,
      count: customers.length,
      percentage: customers.length > 0 
        ? Math.round((customers.length / customers.length) * 100) / 100 
        : 0,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgOrdersPerCustomer: customers.length > 0
        ? Math.round(customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length * 100) / 100
        : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCustomers: customers.length,
          segmentsCount: Object.keys(segments).length,
        },
        segments,
        metrics: segmentMetrics,
        recommendations: [
          segments.vip.length > 0 
            ? `Launch VIP loyalty program for ${segments.vip.length} top customers`
            : null,
          segments.atRisk.length > 0
            ? `Send re-engagement campaign to ${segments.atRisk.length} at-risk customers`
            : null,
          segments.new.length > 0
            ? `Create welcome series for ${segments.new.length} new customers`
            : null,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Customer segments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer segments' },
      { status: 500 }
    );
  }
}
