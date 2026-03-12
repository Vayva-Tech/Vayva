import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/retail/pricing/dynamic
 * Get smart pricing recommendations based on demand, inventory, and competition
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    // Get products
    const where: any = { businessId: session.user.id };
    if (productId) where.id = productId;

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          select: {
            id: true,
            sku: true,
            inventory: true,
            price: true,
            compareAtPrice: true,
          },
        },
        _count: {
          select: {
            orderItems: {
              where: {
                order: {
                  createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                  status: 'completed',
                },
              },
            },
          },
        },
      },
    });

    // Generate pricing recommendations
    const recommendations = products.map(product => {
      const recentSales = product._count.orderItems;
      const avgInventory = product.variants.reduce((sum, v) => sum + v.inventory, 0) / product.variants.length;
      
      // Demand score (0-100)
      const demandScore = Math.min(100, (recentSales / 30) * 100);
      
      // Inventory pressure (low inventory = higher price potential)
      const inventoryScore = avgInventory < 5 ? 80 : avgInventory < 20 ? 60 : avgInventory < 50 ? 40 : 20;
      
      // Recommended price adjustment
      let recommendedAdjustment = 0;
      
      if (demandScore > 70 && inventoryScore > 60) {
        // High demand, low inventory - increase price
        recommendedAdjustment = 10;
      } else if (demandScore < 30 && inventoryScore < 30) {
        // Low demand, high inventory - decrease price
        recommendedAdjustment = -15;
      } else if (demandScore > 50 && inventoryScore > 50) {
        // Moderate conditions - slight increase
        recommendedAdjustment = 5;
      }

      return {
        productId: product.id,
        productName: product.name,
        currentAvgPrice: product.variants.reduce((sum, v) => sum + v.price, 0) / product.variants.length,
        metrics: {
          demandScore: Math.round(demandScore),
          inventoryScore: Math.round(inventoryScore),
          recentSalesCount: recentSales,
          avgInventory: Math.round(avgInventory),
        },
        recommendation: {
          adjustmentPercent: recommendedAdjustment,
          action: recommendedAdjustment > 0 ? 'increase' : recommendedAdjustment < 0 ? 'decrease' : 'maintain',
          confidence: Math.abs(recommendedAdjustment) > 10 ? 'high' : 'medium',
          reasoning: getReasoning(demandScore, inventoryScore, recentSales, avgInventory),
        },
        suggestedPrices: product.variants.map(variant => ({
          variantId: variant.id,
          sku: variant.sku,
          currentPrice: variant.price,
          suggestedPrice: Math.round(variant.price * (1 + recommendedAdjustment / 100) * 100) / 100,
          potentialRevenue: Math.round(variant.price * (1 + recommendedAdjustment / 100) * variant.inventory * 100) / 100,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          productsAnalyzed: recommendations.length,
          recommendIncrease: recommendations.filter(r => r.recommendation.action === 'increase').length,
          recommendDecrease: recommendations.filter(r => r.recommendation.action === 'decrease').length,
          recommendMaintain: recommendations.filter(r => r.recommendation.action === 'maintain').length,
        },
        recommendations,
      },
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pricing recommendations' },
      { status: 500 }
    );
  }
}

function getReasoning(demand: number, inventory: number, sales: number, avgInv: number): string {
  if (demand > 70 && inventory > 60) {
    return `High demand (${sales} sales in 30 days) and low inventory (${Math.round(avgInv)} units) support price increase`;
  }
  if (demand < 30 && inventory < 30) {
    return `Low demand (${sales} sales) and high inventory (${Math.round(avgInv)} units) suggest promotional pricing`;
  }
  if (demand > 50) {
    return `Moderate demand supports slight price optimization`;
  }
  return `Market conditions stable - maintain current pricing strategy`;
}
