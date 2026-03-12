import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        status: 'ACTIVE',
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform product data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images.length > 0 ? product.images : [product.imageUrl].filter(Boolean),
      category: product.category?.name || 'Uncategorized',
      inventory: product.inventory,
      sku: product.sku,
      tags: product.tags,
      brand: product.brand,
      weight: product.weight,
      dimensions: product.dimensions,
      status: product.status,
      createdAt: product.createdAt,
    };

    // Get related products (same category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'ACTIVE',
        id: {
          not: product.id,
        },
      },
      take: 4,
    });

    const transformedRelated = relatedProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      images: p.images.length > 0 ? p.images : [p.imageUrl].filter(Boolean),
      category: product.category?.name || 'Uncategorized',
    }));

    return Response.json({
      product: transformedProduct,
      related: transformedRelated,
    });
  } catch (error) {
    console.error('Product detail API error:', error);
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}