import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/inventory/breakdown
 * Returns inventory breakdown by variant for fashion dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get all product variants with inventory
    const variants = await prisma.productVariant.findMany({
      where: {
        product: {
          storeId,
        },
      },
      include: {
        product: true,
      },
    });

    // Transform to inventory variants with stock status
    const inventoryVariants = variants.map((variant) => {
      const quantity = variant.inventoryCount || 0;
      let status: 'healthy' | 'low' | 'critical' = 'healthy';
      
      if (quantity <= 5) {
        status = 'critical';
      } else if (quantity <= 15) {
        status = 'low';
      }

      return {
        size: variant.size || 'M',
        color: variant.color || 'Black',
        quantity,
        status,
      };
    });

    return NextResponse.json({
      variants: inventoryVariants,
    });
  } catch (error) {
    console.error('Error fetching inventory breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}
