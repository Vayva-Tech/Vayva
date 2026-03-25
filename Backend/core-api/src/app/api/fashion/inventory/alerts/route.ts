import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/fashion/inventory/alerts
 * Get inventory alerts by size/color
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const _alertType = searchParams.get('type') || 'all';
    const threshold = parseInt(searchParams.get('threshold') || '5');

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get low stock variants
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        product: {
          businessId: session.user.id,
        },
        inventory: { lte: threshold },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            images: true,
          },
        },
      },
    });

    // Get fast-moving items (high sales velocity)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          businessId: session.user.id,
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed',
        },
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    // Calculate sales velocity
    const velocityMap: Record<string, { count: number; variantId: string }> = {};
    orderItems.forEach(item => {
      if (!velocityMap[item.variantId]) {
        velocityMap[item.variantId] = { count: 0, variantId: item.variantId };
      }
      velocityMap[item.variantId].count += item.quantity;
    });

    const fastMoving = Object.values(velocityMap)
      .filter(v => v.count > 10) // More than 10 sales in 30 days
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Get dead stock (no sales in 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const allVariants = await prisma.productVariant.findMany({
      where: {
        product: {
          businessId: session.user.id,
        },
        inventory: { gt: 0 },
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    const soldVariantIds = new Set(
      (await prisma.orderItem.findMany({
        where: {
          order: {
            businessId: session.user.id,
            createdAt: { gte: ninetyDaysAgo },
            status: 'completed',
          },
        },
        select: { variantId: true },
      })).map(item => item.variantId!)
    );

    const deadStock = allVariants.filter(v => !soldVariantIds.has(v.id));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          lowStockCount: lowStockVariants.length,
          fastMovingCount: fastMoving.length,
          deadStockCount: deadStock.length,
          totalVariants: allVariants.length,
        },
        alerts: {
          lowStock: lowStockVariants.map(v => ({
            variantId: v.id,
            productName: v.product.name,
            size: v.size,
            color: v.color,
            currentInventory: v.inventory,
            threshold,
            severity: v.inventory === 0 ? 'critical' : v.inventory <= 2 ? 'high' : 'medium',
          })),
          fastMoving: fastMoving.map(f => {
            const variant = allVariants.find(v => v.id === f.variantId);
            return {
              variantId: f.variantId,
              productName: variant?.product.name,
              size: variant?.size,
              color: variant?.color,
              salesLast30Days: f.count,
              currentInventory: variant?.inventory || 0,
              daysUntilStockout: Math.round((variant?.inventory || 0) / (f.count / 30)),
            };
          }),
          deadStock: deadStock.slice(0, 20).map(v => ({
            variantId: v.id,
            productName: v.product.name,
            size: v.size,
            color: v.color,
            inventory: v.inventory,
            lastSaleDate: null,
            daysWithoutSale: 90,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Inventory alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    );
  }
}
