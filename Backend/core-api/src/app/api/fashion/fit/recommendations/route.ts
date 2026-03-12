import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Base where clause for returns
    const returnWhere: any = {
      order: {
        businessId,
      },
      returnReason: {
        in: ['WRONG_SIZE', 'TOO_SMALL', 'TOO_LARGE', 'POOR_FIT'],
      },
    };

    if (productId) {
      returnWhere.productId = productId;
    }

    if (customerId) {
      returnWhere.order = {
        ...returnWhere.order,
        customerId,
      };
    }

    // Get return data grouped by size
    const sizeReturns = await prisma.orderItem.groupBy({
      by: ['variantSize'],
      where: returnWhere,
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
    });

    // Get total sales by size for comparison
    const sizeSales = await prisma.orderItem.groupBy({
      by: ['variantSize'],
      where: {
        order: {
          businessId,
          ...(productId && { productId }),
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
    });

    // Calculate return rates and generate recommendations
    const recommendations = sizeReturns.map(returnData => {
      const size = returnData.variantSize;
      const returnCount = returnData._sum.quantity || 0;
      
      const salesData = sizeSales.find(sale => sale.variantSize === size);
      const totalSold = salesData?._sum.quantity || 1; // Avoid division by zero
      
      const returnRate = (returnCount / totalSold) * 100;
      
      // Generate recommendation based on return rate
      let recommendation = '';
      let priority: 'low' | 'medium' | 'high' = 'low';
      let action = '';
      
      if (returnRate > 15) {
        recommendation = `High return rate (${returnRate.toFixed(1)}%). Consider reviewing sizing specifications.`;
        priority = 'high';
        action = 'Review sizing';
      } else if (returnRate > 8) {
        recommendation = `Moderate return rate (${returnRate.toFixed(1)}%). Monitor sizing feedback.`;
        priority = 'medium';
        action = 'Monitor feedback';
      } else {
        recommendation = `Healthy return rate (${returnRate.toFixed(1)}%). Sizing appears accurate.`;
        action = 'Maintain current';
      }
      
      return {
        size,
        metrics: {
          returns: returnCount,
          totalSold,
          returnRate: parseFloat(returnRate.toFixed(2)),
        },
        recommendation,
        priority,
        action,
      };
    });

    // Get customer-specific recommendations if customerId provided
    let customerRecommendations = null;
    if (customerId) {
      const customerReturns = await prisma.return.findMany({
        where: {
          order: {
            businessId,
            customerId,
          },
          returnReason: {
            in: ['WRONG_SIZE', 'TOO_SMALL', 'TOO_LARGE'],
          },
        },
        include: {
          orderItem: {
            select: {
              variantSize: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // Analyze customer's return patterns
      const sizePattern = customerReturns.reduce((acc, ret) => {
        const size = ret.orderItem.variantSize;
        acc[size] = (acc[size] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostReturnedSizes = Object.entries(sizePattern)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      customerRecommendations = {
        pattern: mostReturnedSizes.map(([size, count]) => ({
          size,
          returnCount: count,
        })),
        suggestion: mostReturnedSizes.length > 0 
          ? `Customer frequently returns size ${mostReturnedSizes[0][0]}. Consider recommending alternative sizes.`
          : 'No significant return patterns detected for this customer.',
      };
    }

    // Get overall fit insights
    const totalReturns = sizeReturns.reduce((sum, item) => sum + (item._sum.quantity || 0), 0);
    const totalSales = sizeSales.reduce((sum, item) => sum + (item._sum.quantity || 0), 0);
    const overallReturnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0;

    const insights = {
      overallReturnRate: parseFloat(overallReturnRate.toFixed(2)),
      totalReturns,
      totalSales,
      problematicSizes: recommendations
        .filter(rec => rec.priority === 'high')
        .map(rec => rec.size),
      healthySizes: recommendations
        .filter(rec => rec.priority === 'low')
        .map(rec => rec.size),
    };

    return NextResponse.json({
      success: true,
      data: {
        sizeRecommendations: recommendations,
        customerRecommendations,
        insights,
        timeframe: 'Last 90 days',
      },
    });
  } catch (error) {
    console.error('Error fetching fit recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fit recommendations' },
      { status: 500 }
    );
  }
}