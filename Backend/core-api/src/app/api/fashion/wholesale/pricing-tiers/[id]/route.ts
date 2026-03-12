import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      minOrderValue, 
      discountPercentage, 
      description,
      benefits,
      isActive 
    } = body;

    // Check if tier exists
    const existingTier = await prisma.wholesalePricingTier.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingTier) {
      return NextResponse.json(
        { error: 'Pricing tier not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current tier)
    if (name) {
      const duplicateTier = await prisma.wholesalePricingTier.findFirst({
        where: {
          businessId: existingTier.businessId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
          id: {
            not: params.id,
          },
          deletedAt: null,
        },
      });

      if (duplicateTier) {
        return NextResponse.json(
          { error: 'Pricing tier with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedTier = await prisma.wholesalePricingTier.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(minOrderValue !== undefined && { minOrderValue }),
        ...(discountPercentage !== undefined && { discountPercentage }),
        ...(description !== undefined && { description }),
        ...(benefits && { benefits }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTier,
    });
  } catch (error) {
    console.error('Error updating wholesale pricing tier:', error);
    return NextResponse.json(
      { error: 'Failed to update wholesale pricing tier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if tier exists
    const existingTier = await prisma.wholesalePricingTier.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingTier) {
      return NextResponse.json(
        { error: 'Pricing tier not found' },
        { status: 404 }
      );
    }

    // Check if tier is being used by customers
    const customerCount = await prisma.wholesaleCustomer.count({
      where: {
        pricingTierId: params.id,
      },
    });

    if (customerCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tier that is assigned to customers' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.wholesalePricingTier.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pricing tier deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting wholesale pricing tier:', error);
    return NextResponse.json(
      { error: 'Failed to delete wholesale pricing tier' },
      { status: 500 }
    );
  }
}