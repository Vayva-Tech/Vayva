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
    const threshold = parseFloat(searchParams.get('threshold') || '0.2'); // 20% default

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Get ingredients where current stock is below threshold
    const lowStockIngredients = await prisma.inventoryItem.findMany({
      where: {
        businessId,
        deletedAt: null,
        AND: [
          { currentStock: { gt: 0 } }, // Has some stock
          {
            currentStock: {
              lte: {
                multiply: ['unitCost', threshold], // This would need to be adjusted based on your schema
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        unit: true,
        reorderPoint: true,
        supplier: true,
        lastUpdated: true,
        _count: {
          select: {
            menuItemIngredients: true,
          },
        },
      },
      orderBy: {
        currentStock: 'asc',
      },
    });

    // Alternative approach if the above doesn't work with your schema:
    const allIngredients = await prisma.inventoryItem.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        unit: true,
        reorderPoint: true,
        supplier: true,
        lastUpdated: true,
        _count: {
          select: {
            menuItemIngredients: true,
          },
        },
      },
    });

    const filteredLowStock = allIngredients.filter(ingredient => {
      if (ingredient.currentStock <= 0) return false;
      if (!ingredient.reorderPoint) return false;
      return ingredient.currentStock <= ingredient.reorderPoint;
    }).sort((a, b) => a.currentStock - b.currentStock);

    return NextResponse.json({
      success: true,
      data: {
        lowStockItems: filteredLowStock,
        count: filteredLowStock.length,
        threshold,
      },
    });
  } catch (error) {
    console.error('Error fetching low stock ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock ingredients' },
      { status: 500 }
    );
  }
}