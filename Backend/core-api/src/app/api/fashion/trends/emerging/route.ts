import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/fashion/trends/emerging
 * Get emerging fashion trends in real-time
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const _category = searchParams.get('category');
    const timeframe = searchParams.get('timeframe') || '7d';

    const now = new Date();
    const daysMap: Record<string, number> = { '7d': 7, '14d': 14, '30d': 30 };
    const days = daysMap[timeframe] || 7;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get recent orders with product details
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          businessId: session.user.id,
          createdAt: { gte: startDate },
          status: 'completed',
        },
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                tags: true,
                collection: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Analyze trends
    const trendAnalysis: Record<string, {
      productId: string;
      productName: string;
      category: string;
      tags: string[];
      salesCount: number;
      revenue: number;
      velocity: number;
      isNew: boolean;
      growthRate: number;
    }> = {};

    orderItems.forEach(item => {
      const product = item.variant?.product;
      if (!product) return;

      if (!trendAnalysis[product.id]) {
        trendAnalysis[product.id] = {
          productId: product.id,
          productName: product.name,
          category: product.category || 'Other',
          tags: product.tags || [],
          salesCount: 0,
          revenue: 0,
          velocity: 0,
          isNew: (now.getTime() - product.createdAt.getTime()) < (30 * 24 * 60 * 60 * 1000),
          growthRate: 0,
        };
      }

      trendAnalysis[product.id].salesCount += item.quantity;
      trendAnalysis[product.id].revenue += item.price * item.quantity;
    });

    // Calculate velocity (sales per day)
    Object.values(trendAnalysis).forEach(product => {
      product.velocity = product.salesCount / days;
    });

    // Sort by multiple factors to find emerging trends
    const emergingTrends = Object.values(trendAnalysis)
      .map(product => {
        // Score calculation: velocity * 0.4 + isNew bonus * 0.3 + revenue * 0.3
        const velocityScore = product.velocity * 10;
        const newBonus = product.isNew ? 5 : 0;
        const revenueScore = product.revenue / 100;
        
        product.growthRate = velocityScore;
        
        return {
          ...product,
          score: velocityScore + newBonus + revenueScore,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Group by category
    const trendsByCategory: Record<string, typeof emergingTrends> = {};
    emergingTrends.forEach(product => {
      if (!trendsByCategory[product.category]) {
        trendsByCategory[product.category] = [];
      }
      trendsByCategory[product.category].push(product);
    });

    // Identify trending tags
    const tagFrequency: Record<string, number> = {};
    emergingTrends.forEach(product => {
      product.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const trendingTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          timeframe: `${days} days`,
          totalProductsAnalyzed: Object.keys(trendAnalysis).length,
          emergingTrendsCount: emergingTrends.length,
          categoriesFound: Object.keys(trendsByCategory).length,
        },
        emergingTrends,
        byCategory: Object.entries(trendsByCategory).map(([category, products]) => ({
          category,
          topProducts: products.slice(0, 5),
        })),
        trendingTags,
        insights: [
          emergingTrends.filter(p => p.isNew).length > 5
            ? 'New products are performing well this period'
            : 'Established products dominate sales',
          trendingTags[0]
            ? `#${trendingTags[0].tag} is the most popular attribute`
            : 'No clear attribute trend detected',
        ],
      },
    });
  } catch (error) {
    console.error('Emerging trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emerging trends' },
      { status: 500 }
    );
  }
}
