import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/lookbooks
 * Returns list of lookbooks for a store
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const where: any = { storeId };
    
    if (status) {
      where.status = status;
    }

    const lookbooks = await prisma.lookbook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            productImages: true,
          },
        },
      },
    });

    // Transform to match frontend interface
    const transformedLookbooks = lookbooks.map((lb) => ({
      id: lb.id,
      name: lb.name,
      status: lb.status as 'draft' | 'published' | 'archived',
      views: lb.views || 0,
      conversion: lb.conversionRate || 0,
      images: lb.products
        .flatMap((p) => p.productImages.map((img) => img.url))
        .slice(0, 4),
      createdAt: lb.createdAt,
    }));

    return NextResponse.json({
      lookbooks: transformedLookbooks,
    });
  } catch (error) {
    console.error('Error fetching lookbooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lookbooks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fashion/lookbooks
 * Create a new lookbook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, productIds } = body;

    if (!storeId || !name) {
      return NextResponse.json(
        { error: 'Store ID and name required' },
        { status: 400 }
      );
    }

    const lookbook = await prisma.lookbook.create({
      data: {
        storeId,
        name,
        status: 'draft',
        products: {
          connect: productIds?.map((id: string) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json({ lookbook }, { status: 201 });
  } catch (error) {
    console.error('Error creating lookbook:', error);
    return NextResponse.json(
      { error: 'Failed to create lookbook' },
      { status: 500 }
    );
  }
}
