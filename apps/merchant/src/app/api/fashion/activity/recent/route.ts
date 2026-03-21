import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/activity/recent
 * Returns recent activity feed for fashion dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const activities: Array<{
      id: string;
      type: 'order' | 'restock' | 'review' | 'lookbook' | 'wholesale';
      title: string;
      description: string;
      timestamp: string;
      icon?: string;
    }> = [];

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        customer: true,
      },
    });

    recentOrders.forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `New order #${order.id.slice(-4)}`,
        description: `${order.customer?.name || 'Customer'} - $${Number(order.totalAmount).toFixed(2)}`,
        timestamp: formatTimestamp(order.createdAt),
        icon: '🛒',
      });
    });

    // Get low stock alerts (restock)
    const lowStockProducts = await prisma.productVariant.findMany({
      where: {
        inventoryCount: { lte: 10 },
        product: { storeId },
      },
      include: { product: true },
      take: 2,
    });

    lowStockProducts.forEach((variant) => {
      activities.push({
        id: `restock-${variant.id}`,
        type: 'restock',
        title: 'Restock alert',
        description: `${variant.product.title} - Size ${variant.size || 'M'} only ${variant.inventoryCount} left`,
        timestamp: formatTimestamp(new Date()),
        icon: '📦',
      });
    });

    // Get recent reviews (if available)
    // TODO: Integrate with actual review system
    activities.push({
      id: 'review-1',
      type: 'review',
      title: 'Review received',
      description: '5 stars - "Amazing quality!"',
      timestamp: formatTimestamp(new Date(Date.now() - 3600000)),
      icon: '⭐',
    });

    // Get recent lookbook publications
    const recentLookbooks = await prisma.lookbook.findMany({
      where: {
        storeId,
        status: 'published',
      },
      orderBy: { updatedAt: 'desc' },
      take: 1,
    });

    recentLookbooks.forEach((lb) => {
      activities.push({
        id: `lookbook-${lb.id}`,
        type: 'lookbook',
        title: `Lookbook "${lb.name}" published`,
        description: 'New collection now live',
        timestamp: formatTimestamp(lb.updatedAt),
        icon: '🎨',
      });
    });

    // Sort by timestamp and return
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}
