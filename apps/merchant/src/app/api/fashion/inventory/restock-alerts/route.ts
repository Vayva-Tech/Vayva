import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/inventory/restock-alerts
 * Returns low stock alerts for fashion inventory
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get variants with low inventory
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        inventoryCount: {
          lte: 15,
        },
        product: {
          storeId,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        inventoryCount: 'asc',
      },
    });

    const alerts = lowStockVariants.map((variant) => ({
      id: variant.id,
      productName: variant.product.title,
      size: variant.size || 'M',
      color: variant.color || 'N/A',
      currentStock: variant.inventoryCount || 0,
      threshold: 15,
      recommendedOrder: Math.max(50 - (variant.inventoryCount || 0), 20),
      urgency: (variant.inventoryCount || 0) <= 5 ? 'critical' : 'low',
    }));

    return NextResponse.json({
      alerts,
    });
  } catch (error) {
    console.error('Error fetching restock alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restock alerts' },
      { status: 500 }
    );
  }
}
