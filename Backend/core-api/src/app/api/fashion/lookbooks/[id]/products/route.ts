import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/fashion/lookbooks/:id/products
 * Get products in a lookbook
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lookbook = await prisma.lookbook.findUnique({
      where: { id: params.id, businessId: session.user.id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                images: true,
                price: true,
                variants: {
                  select: {
                    id: true,
                    size: true,
                    color: true,
                    inventory: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!lookbook) {
      return NextResponse.json(
        { error: 'Lookbook not found' },
        { status: 404 }
      );
    }

    const enrichedProducts = lookbook.products.map(lp => ({
      position: lp.position,
      featured: lp.featured,
      ...lp.product,
      totalInventory: lp.product.variants.reduce((sum, v) => sum + v.inventory, 0),
    }));

    return NextResponse.json({
      success: true,
      data: {
        lookbook: {
          id: lookbook.id,
          name: lookbook.name,
          description: lookbook.description,
          isActive: lookbook.isActive,
          createdAt: lookbook.createdAt,
          updatedAt: lookbook.updatedAt,
        },
        products: enrichedProducts,
        summary: {
          totalProducts: enrichedProducts.length,
          featuredCount: enrichedProducts.filter(p => p.featured).length,
          totalValue: enrichedProducts.reduce((sum, p) => sum + (p.price || 0), 0),
          inStockCount: enrichedProducts.filter(p => p.totalInventory > 0).length,
        },
      },
    });
  } catch (error) {
    console.error('Get lookbook products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lookbook products' },
      { status: 500 }
    );
  }
}
