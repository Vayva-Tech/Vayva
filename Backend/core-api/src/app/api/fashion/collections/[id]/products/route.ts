import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Verify collection exists
    const collection = await prisma.productCollection.findUnique({
      where: {
        id: params.id,
        businessId,
        deletedAt: null,
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Get products in this collection
    const products = await prisma.product.findMany({
      where: {
        businessId,
        collections: {
          some: {
            collectionId: params.id,
          },
        },
        deletedAt: null,
      },
      include: {
        variants: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            stockQuantity: true,
            price: true,
          },
        },
        _count: {
          select: {
            variants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        collection,
        products,
        productCount: products.length,
      },
    });
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection products' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, productIds } = body;

    if (!businessId || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Business ID and product IDs array are required' },
        { status: 400 }
      );
    }

    // Verify collection exists
    const collection = await prisma.productCollection.findUnique({
      where: {
        id: params.id,
        businessId,
        deletedAt: null,
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Add products to collection
    const collectionProducts = await Promise.all(
      productIds.map(productId =>
        prisma.collectionProduct.upsert({
          where: {
            collectionId_productId: {
              collectionId: params.id,
              productId,
            },
          },
          update: {},
          create: {
            collectionId: params.id,
            productId,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: collectionProducts,
      message: `${productIds.length} products added to collection`,
    });
  } catch (error) {
    console.error('Error adding products to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add products to collection' },
      { status: 500 }
    );
  }
}