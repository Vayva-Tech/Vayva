import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/restaurant/menu/popular-items
 * Get best-selling menu items with analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    // Get top-selling items
    const popularItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          businessId: session.user.id,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          status: 'completed',
        },
      },
      _sum: {
        quantity: true,
      },
      _avg: {
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Enrich with menu item details
    const enrichedItems = await Promise.all(
      popularItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId! },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            isAvailable: true,
            recipeCost: true,
            prepTime: true,
            imageUrl: true,
          },
        });

        const totalQuantity = item._sum.quantity || 0;
        const revenue = totalQuantity * (menuItem?.price || 0);
        const profit = revenue - (totalQuantity * (menuItem?.recipeCost || 0));
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          menuItemId: item.menuItemId,
          name: menuItem?.name || 'Unknown Item',
          category: menuItem?.category || 'Other',
          totalQuantitySold: totalQuantity,
          averagePrice: item._avg.price || 0,
          revenue: Math.round(revenue * 100) / 100,
          profit: Math.round(profit * 100) / 100,
          profitMargin: Math.round(profitMargin * 100) / 100,
          isAvailable: menuItem?.isAvailable ?? false,
          prepTime: menuItem?.prepTime || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalItemsAnalyzed: popularItems.length,
          dateRange: { startDate, endDate },
        },
        popularItems: enrichedItems,
      },
    });
  } catch (error) {
    console.error('Popular items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular items' },
      { status: 500 }
    );
  }
}
