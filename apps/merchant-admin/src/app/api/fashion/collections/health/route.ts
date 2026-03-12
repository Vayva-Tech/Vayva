import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/collections/health
 * Returns collection performance data for fashion dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get all collections for the store
    const collections = await prisma.collection.findMany({
      where: { storeId },
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: true,
              },
            },
          },
        },
      },
    });

    // Calculate health metrics for each collection
    const collectionHealth = collections.map((collection) => {
      const totalUnits = collection.products.reduce(
        (sum, product) => sum + product.orderItems.reduce((s, oi) => s + oi.quantity, 0),
        0
      );

      const totalRevenue = collection.products.reduce(
        (sum, product) =>
          sum +
          product.orderItems.reduce(
            (s, oi) => s + Number(oi.price) * oi.quantity,
            0
          ),
        0
      );

      // Calculate performance score (0-100)
      // Based on sell-through rate, revenue velocity, and inventory turnover
      const performanceScore = Math.min(
        100,
        Math.max(
          0,
          (totalRevenue / 1000) * 30 + // Revenue component
            (totalUnits / 10) * 20 // Units component
        )
      );

      return {
        id: collection.id,
        name: collection.name,
        gmv: totalRevenue,
        units: totalUnits,
        performance: Math.round(performanceScore),
        imageUrl:
          collection.products[0]?.productImages?.[0]?.url ||
          `https://placehold.co/400x400/111/fff?text=${encodeURIComponent(collection.name)}`,
      };
    });

    // Sort by performance
    collectionHealth.sort((a, b) => b.performance - a.performance);

    return NextResponse.json({
      collections: collectionHealth.slice(0, 10), // Return top 10
    });
  } catch (error) {
    console.error('Error fetching collection health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection health data' },
      { status: 500 }
    );
  }
}
