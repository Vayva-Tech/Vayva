import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/prisma';

/**
 * GET /api/fashion/lookbooks/[id]
 * Get a specific lookbook
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lookbook = await prisma.lookbook.findUnique({
      where: { id: params.id },
      include: {
        products: {
          include: {
            productImages: true,
          },
        },
      },
    });

    if (!lookbook) {
      return NextResponse.json({ error: 'Lookbook not found' }, { status: 404 });
    }

    return NextResponse.json({
      lookbook: {
        id: lookbook.id,
        name: lookbook.name,
        status: lookbook.status,
        views: lookbook.views || 0,
        conversion: lookbook.conversionRate || 0,
        images: lookbook.products
          .flatMap((p) => p.productImages.map((img) => img.url))
          .slice(0, 8),
        createdAt: lookbook.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching lookbook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lookbook' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/fashion/lookbooks/[id]
 * Update a lookbook
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, status, productIds } = body;

    const lookbook = await prisma.lookbook.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(productIds && {
          products: {
            set: productIds.map((id: string) => ({ id })),
          },
        }),
      },
    });

    return NextResponse.json({ lookbook });
  } catch (error) {
    console.error('Error updating lookbook:', error);
    return NextResponse.json(
      { error: 'Failed to update lookbook' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fashion/lookbooks/[id]
 * Delete a lookbook
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lookbook.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lookbook:', error);
    return NextResponse.json(
      { error: 'Failed to delete lookbook' },
      { status: 500 }
    );
  }
}
