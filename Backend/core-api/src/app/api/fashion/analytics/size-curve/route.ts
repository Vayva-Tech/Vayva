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
    const categoryId = searchParams.get('categoryId');
    const collectionId = searchParams.get('collectionId');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Calculate date range
    const endDate = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Base where clause for products
    const productWhere: any = {
      businessId,
      deletedAt: null,
    };

    if (categoryId) {
      productWhere.categoryId = categoryId;
    }

    if (collectionId) {
      productWhere.collections = {
        some: {
          collectionId,
        },
      };
    }

    // Get all product variants
    const variants = await prisma.productVariant.findMany({
      where: productWhere,
      include: {
        product: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              status: {
                not: 'CANCELLED',
              },
            },
          },
        },
      },
    });

    // Group by size and calculate metrics
    const sizeData = variants.reduce((acc, variant) => {
      const size = variant.size || 'Unknown';
      
      if (!acc[size]) {
        acc[size] = {
          size,
          inventory: 0,
          sold: 0,
          revenue: 0,
          products: new Set(),
        };
      }

      // Add inventory
      acc[size].inventory += variant.stockQuantity;
      
      // Add sales data
      variant.orderItems.forEach(orderItem => {
        acc[size].sold += orderItem.quantity;
        acc[size].revenue += orderItem.quantity * (orderItem.price || 0);
        acc[size].products.add(variant.productId);
      });

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate percentages
    const sizeCurve = Object.values(sizeData).map((data: any) => {
      const totalInventory = Object.values(sizeData).reduce((sum: number, item: any) => 
        sum + item.inventory, 0
      );
      const totalSold = Object.values(sizeData).reduce((sum: number, item: any) => 
        sum + item.sold, 0
      );

      return {
        size: data.size,
        inventory: data.inventory,
        sold: data.sold,
        revenue: parseFloat(data.revenue.toFixed(2)),
        productCount: data.products.size,
        inventoryPercentage: totalInventory > 0 ? 
          parseFloat(((data.inventory / totalInventory) * 100).toFixed(1)) : 0,
        salesPercentage: totalSold > 0 ? 
          parseFloat(((data.sold / totalSold) * 100).toFixed(1)) : 0,
      };
    }).sort((a: any, b: any) => {
      // Sort sizes logically (S, M, L, XL, etc.)
      const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      const aIndex = sizeOrder.indexOf(a.size);
      const bIndex = sizeOrder.indexOf(b.size);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.size.localeCompare(b.size);
    });

    // Calculate health scores
    const healthScores = sizeCurve.map((item: any) => {
      // Ideal distribution is relatively even across sizes
      const idealPercentage = 100 / sizeCurve.length;
      const deviation = Math.abs(item.salesPercentage - idealPercentage);
      
      let healthScore = 100;
      if (deviation > 30) healthScore = 30;
      else if (deviation > 20) healthScore = 50;
      else if (deviation > 10) healthScore = 70;
      else if (deviation > 5) healthScore = 85;
      
      // Adjust for stockouts
      if (item.inventory === 0 && item.sold > 0) {
        healthScore = Math.min(healthScore, 20);
      }
      
      // Adjust for overstock
      if (item.inventory > item.sold * 5 && item.sold > 0) {
        healthScore = Math.min(healthScore, 60);
      }

      return {
        size: item.size,
        healthScore,
        status: healthScore >= 80 ? 'healthy' : 
               healthScore >= 60 ? 'needs_attention' : 
               healthScore >= 40 ? 'concern' : 'critical',
        recommendations: getRecommendations(item, healthScore),
      };
    });

    // Summary statistics
    const totalInventory = sizeCurve.reduce((sum: number, item: any) => sum + item.inventory, 0);
    const totalSold = sizeCurve.reduce((sum: number, item: any) => sum + item.sold, 0);
    const totalRevenue = sizeCurve.reduce((sum: number, item: any) => sum + item.revenue, 0);

    const summary = {
      totalSizes: sizeCurve.length,
      totalInventory,
      totalSold,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageHealthScore: parseFloat(
        (healthScores.reduce((sum: number, item: any) => sum + item.healthScore, 0) / healthScores.length).toFixed(0)
      ),
      bestPerformingSize: sizeCurve.reduce((best: any, current: any) => 
        current.sold > best.sold ? current : best, { sold: 0, size: '' }
      ).size,
      worstPerformingSize: sizeCurve.reduce((worst: any, current: any) => 
        current.sold < worst.sold ? current : worst, { sold: Infinity, size: '' }
      ).size,
    };

    return NextResponse.json({
      success: true,
      data: {
        sizeCurve,
        healthScores,
        summary,
        timeframe,
        filters: {
          categoryId: categoryId || null,
          collectionId: collectionId || null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching size curve analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch size curve analytics' },
      { status: 500 }
    );
  }
}

function getRecommendations(item: any, healthScore: number) {
  const recommendations = [];
  
  if (healthScore < 60) {
    if (item.inventory === 0) {
      recommendations.push('Restock immediately - size is selling but out of stock');
    } else if (item.inventory > item.sold * 3) {
      recommendations.push('Consider reducing inventory - overstocked relative to demand');
    } else {
      recommendations.push('Investigate sizing issues - poor sales performance');
    }
  } else if (healthScore < 80) {
    recommendations.push('Monitor performance - room for improvement');
  } else {
    recommendations.push('Size performance is healthy - maintain current strategy');
  }
  
  return recommendations;
}