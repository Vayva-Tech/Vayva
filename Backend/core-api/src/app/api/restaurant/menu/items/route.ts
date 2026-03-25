import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status'); // active, inactive, sold_out
    const search = searchParams.get('search');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const where: any = {
      businessId,
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: {
        sortOrder: 'asc',
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
          select: {
            id: true,
            ingredient: {
              select: {
                name: true,
                unit: true,
              },
            },
            quantity: true,
          },
        },
        modifiers: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            modifierGroup: {
              select: {
                name: true,
                minSelections: true,
                maxSelections: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessId,
      categoryId,
      name,
      description,
      price,
      cost,
      prepTime,
      station,
      status,
      sortOrder,
      allergens,
      _ingredients,
      _modifiers,
    } = body;

    if (!businessId || !categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Business ID, Category ID, name, and price are required' },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.menuCategory.findUnique({
      where: {
        id: categoryId,
        businessId,
        deletedAt: null,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        businessId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Menu item with this name already exists' },
        { status: 409 }
      );
    }

    const item = await prisma.menuItem.create({
      data: {
        businessId,
        categoryId,
        name,
        description,
        price,
        cost: cost || 0,
        prepTime: prepTime || 0,
        station: station || 'General',
        status: status || 'active',
        sortOrder: sortOrder || 0,
        allergens: allergens || [],
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}