import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/size-curves
 * Returns size distribution data for fashion dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category') || 'all';

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get order items with product variants
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          storeId,
        },
      },
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
    });

    // Filter by category if specified
    let filteredItems = orderItems;
    if (category !== 'all') {
      filteredItems = orderItems.filter(
        (item) => item.productVariant?.product.category === category
      );
    }

    // Calculate size distribution
    const sizeMap = new Map<
      string,
      { size: string; percentage: number; units: number; revenue: number }
    >();

    filteredItems.forEach((item) => {
      const size = item.productVariant?.size || 'M'; // Default to M if no size
      const existing = sizeMap.get(size);
      
      if (existing) {
        existing.units += item.quantity;
        existing.revenue += Number(item.price) * item.quantity;
      } else {
        sizeMap.set(size, {
          size,
          percentage: 0, // Will calculate later
          units: item.quantity,
          revenue: Number(item.price) * item.quantity,
        });
      }
    });

    // Convert to array and calculate percentages
    const totalUnits = Array.from(sizeMap.values()).reduce(
      (sum, s) => sum + s.units,
      0
    );

    const distribution = Array.from(sizeMap.values()).map((sizeData) => ({
      ...sizeData,
      percentage: (sizeData.units / totalUnits) * 100,
    }));

    // Find top size
    const topSize = distribution.reduce((max, current) =>
      current.percentage > max.percentage ? current : max
    ).size;

    // Generate restock alerts (sizes with low inventory)
    // TODO: Integrate with actual inventory levels
    const restockAlerts = distribution
      .filter((s) => s.size === 'XL' || s.size === 'XXL')
      .map((s) => ({
        size: s.size,
        currentStock: Math.floor(Math.random() * 10),
        threshold: 15,
        recommendedOrder: 50,
      }));

    return NextResponse.json({
      category: category === 'all' ? 'All Products' : category,
      distribution,
      topSize,
      restockAlerts,
    });
  } catch (error) {
    console.error('Error fetching size curves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch size curve data' },
      { status: 500 }
    );
  }
}
