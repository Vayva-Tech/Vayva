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

    const category = await prisma.menuCategory.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        items: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching menu category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu category' },
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
    const { name, description, sortOrder, isActive } = body;

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current category)
    if (name) {
      const duplicateCategory = await prisma.menuCategory.findFirst({
        where: {
          businessId: existingCategory.businessId,
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

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating menu category:', error);
    return NextResponse.json(
      { error: 'Failed to update menu category' },
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

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has items
    const itemCount = await prisma.menuItem.count({
      where: {
        categoryId: params.id,
        deletedAt: null,
      },
    });

    if (itemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing menu items' },
        { status: 400 }
      );
    }

    // Soft delete
    const deletedCategory = await prisma.menuCategory.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu category:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu category' },
      { status: 500 }
    );
  }
}