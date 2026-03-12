import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/restaurant/analytics/food-cost
 * Get food cost analytics and variance tracking
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    // Get ingredient usage data
    const usageLogs = await prisma.ingredientUsageLog.findMany({
      where: {
        businessId: session.user.id,
        usedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unitCost: true,
            category: true,
          },
        },
      },
    });

    // Calculate actual food cost
    const actualFoodCost = usageLogs.reduce((sum, log) => {
      return sum + (log.quantityUsed * log.ingredient.unitCost);
    }, 0);

    // Get menu items sold with their costs
    const orderItems = await prisma.orderItem.findMany({
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
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true,
            recipeCost: true,
            category: true,
          },
        },
      },
    });

    // Calculate theoretical vs actual cost
    const theoreticalCost = orderItems.reduce((sum, item) => {
      return sum + (item.menuItem.recipeCost || 0) * item.quantity;
    }, 0);

    const totalSales = orderItems.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);

    const variance = actualFoodCost - theoreticalCost;
    const variancePercentage = theoreticalCost > 0 ? (variance / theoreticalCost) * 100 : 0;
    const foodCostPercentage = totalSales > 0 ? (actualFoodCost / totalSales) * 100 : 0;

    // Group by category
    const costByCategory: Record<string, {
      actual: number;
      theoretical: number;
      sales: number;
    }> = {};

    orderItems.forEach((item) => {
      const category = item.menuItem.category || 'Other';
      if (!costByCategory[category]) {
        costByCategory[category] = { actual: 0, theoretical: 0, sales: 0 };
      }
      costByCategory[category].theoretical += (item.menuItem.recipeCost || 0) * item.quantity;
      costByCategory[category].sales += item.menuItem.price * item.quantity;
    });

    // Map ingredient usage to categories
    usageLogs.forEach((log) => {
      const category = log.ingredient.category || 'Other';
      if (!costByCategory[category]) {
        costByCategory[category] = { actual: 0, theoretical: 0, sales: 0 };
      }
      costByCategory[category].actual += log.quantityUsed * log.ingredient.unitCost;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          actualFoodCost: Math.round(actualFoodCost * 100) / 100,
          theoreticalCost: Math.round(theoreticalCost * 100) / 100,
          variance: Math.round(variance * 100) / 100,
          variancePercentage: Math.round(variancePercentage * 100) / 100,
          totalSales: Math.round(totalSales * 100) / 100,
          foodCostPercentage: Math.round(foodCostPercentage * 100) / 100,
          targetFoodCostPercentage: 30, // Industry standard target
        },
        breakdown: {
          byCategory: Object.entries(costByCategory).map(([category, data]) => ({
            category,
            actualCost: Math.round(data.actual * 100) / 100,
            theoreticalCost: Math.round(data.theoretical * 100) / 100,
            sales: Math.round(data.sales * 100) / 100,
            foodCostPercentage: data.sales > 0 
              ? Math.round((data.actual / data.sales) * 100) / 100 
              : 0,
          })),
          topIngredients: usageLogs
            .reduce((acc, log) => {
              const existing = acc.find((i) => i.ingredientId === log.ingredientId);
              if (existing) {
                existing.totalCost += log.quantityUsed * log.ingredient.unitCost;
                existing.totalQuantity += log.quantityUsed;
              } else {
                acc.push({
                  ingredientId: log.ingredientId,
                  ingredientName: log.ingredient.name,
                  totalCost: log.quantityUsed * log.ingredient.unitCost,
                  totalQuantity: log.quantityUsed,
                });
              }
              return acc;
            }, [] as Array<{
              ingredientId: string;
              ingredientName: string;
              totalCost: number;
              totalQuantity: number;
            }>)
            .sort((a, b) => b.totalCost - a.totalCost)
            .slice(0, 10)
            .map((item) => ({
              ...item,
              totalCost: Math.round(item.totalCost * 100) / 100,
              totalQuantity: Math.round(item.totalQuantity * 100) / 100,
            })),
        },
      },
    });
  } catch (error) {
    console.error('Food cost analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food cost analytics' },
      { status: 500 }
    );
  }
}
