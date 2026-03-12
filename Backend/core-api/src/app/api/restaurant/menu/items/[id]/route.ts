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

    const item = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        ingredients: {
          where: {
            deletedAt: null,
          },
          include: {
            ingredient: true,
          },
        },
        modifiers: {
          where: {
            deletedAt: null,
          },
          include: {
            modifierGroup: {
              include: {
                modifiers: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

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
      description,
      price,
      cost,
      prepTime,
      station,
      status,
      sortOrder,
      allergens,
    } = body;

    // Check if item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current item)
    if (name) {
      const duplicateItem = await prisma.menuItem.findFirst({
        where: {
          businessId: existingItem.businessId,
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

      if (duplicateItem) {
        return NextResponse.json(
          { error: 'Menu item with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(cost !== undefined && { cost }),
        ...(prepTime !== undefined && { prepTime }),
        ...(station && { station }),
        ...(status && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(allergens && { allergens }),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
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

    // Check if item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Soft delete
    const deletedItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}