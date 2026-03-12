import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/fashion/collections/:id/performance
 * Get detailed performance analytics for a collection
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

    const collection = await prisma.collection.findUnique({
      where: { id: params.id, businessId: session.user.id },
      include: {
        products: {
          include: {
            variants: true,
            _count: {
              select: {
                orderItems: {
                  where: {
                    order: {
                      createdAt: { gte: new Date(collection.createdAt) },
                      status: 'completed',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Calculate performance metrics
    const productMetrics = collection.products.map(product => {
      const totalSales = product._count.orderItems;
      const totalRevenue = product.variants.reduce((sum, variant) => {
        return sum + (variant.price * (variant.inventory > 0 ? 1 : 0));
      }, 0);
      
      const totalInventory = product.variants.reduce((sum, v) => sum + v.inventory, 0);
      const sellThroughRate = totalInventory > 0 
        ? ((totalSales / (totalSales + totalInventory)) * 100)
        : 0;

      return {
        productId: product.id,
        name: product.name,
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalInventory,
        sellThroughRate: Math.round(sellThroughRate * 100) / 100,
        performance: sellThroughRate > 70 ? 'excellent' : sellThroughRate > 50 ? 'good' : sellThroughRate > 30 ? 'average' : 'poor',
      };
    });

    const totalCollectionRevenue = productMetrics.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalCollectionSales = productMetrics.reduce((sum, p) => sum + p.totalSales, 0);
    const avgSellThrough = productMetrics.reduce((sum, p) => sum + p.sellThroughRate, 0) / productMetrics.length;

    // Top performers
    const topPerformers = [...productMetrics]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Underperformers
    const underperformers = [...productMetrics]
      .filter(p => p.performance === 'poor')
      .sort((a, b) => a.sellThroughRate - b.sellThroughRate)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          season: collection.season,
          year: collection.year,
          isActive: collection.isActive,
          launchDate: collection.launchDate,
        },
        summary: {
          totalProducts: productMetrics.length,
          totalRevenue: Math.round(totalCollectionRevenue * 100) / 100,
          totalSales: totalCollectionSales,
          avgSellThroughRate: Math.round(avgSellThrough * 100) / 100,
          overallPerformance: avgSellThrough > 60 ? 'excellent' : avgSellThrough > 40 ? 'good' : 'needs_improvement',
        },
        productMetrics,
        topPerformers,
        underperformers,
        insights: [
          avgSellThrough > 60 
            ? `Collection is performing excellently with ${Math.round(avgSellThrough)}% average sell-through`
            : `Collection needs attention with ${Math.round(avgSellThrough)}% average sell-through`,
          topPerformers.length > 0
            ? `Top performer: ${topPerformers[0].name} with $${topPerformers[0].totalRevenue} revenue`
            : 'No standout performers yet',
          underperformers.length > 0
            ? `${underperformers.length} products need promotional support`
            : 'All products performing adequately',
        ],
      },
    });
  } catch (error) {
    console.error('Collection performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection performance' },
      { status: 500 }
    );
  }
}
