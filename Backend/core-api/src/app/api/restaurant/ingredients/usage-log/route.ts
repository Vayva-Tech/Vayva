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
    const ingredientId = searchParams.get('ingredientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const where: any = {
      businessId,
    };

    if (ingredientId) {
      where.ingredientId = ingredientId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const usageLogs = await prisma.inventoryTransaction.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ingredient: {
          select: {
            name: true,
            unit: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate summary statistics
    const summary = await prisma.inventoryTransaction.groupBy({
      by: ['ingredientId'],
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    const ingredientSummary = await Promise.all(
      summary.map(async (item) => {
        const ingredient = await prisma.inventoryItem.findUnique({
          where: { id: item.ingredientId },
          select: { name: true, unit: true },
        });
        return {
          ingredientId: item.ingredientId,
          ingredientName: ingredient?.name,
          totalQuantity: Math.abs(item._sum.quantity || 0), // Make positive for usage
          transactionCount: item._count.id,
          unit: ingredient?.unit,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        logs: usageLogs,
        summary: ingredientSummary,
        totalCount: usageLogs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching ingredient usage log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredient usage log' },
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
    const { businessId, ingredientId, quantity, transactionType, notes, orderId } = body;

    if (!businessId || !ingredientId || !quantity) {
      return NextResponse.json(
        { error: 'Business ID, ingredient ID, and quantity are required' },
        { status: 400 }
      );
    }

    // Verify ingredient exists
    const ingredient = await prisma.inventoryItem.findUnique({
      where: {
        id: ingredientId,
        businessId,
        deletedAt: null,
      },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Create usage log entry
    const usageLog = await prisma.inventoryTransaction.create({
      data: {
        businessId,
        ingredientId,
        quantity: -Math.abs(quantity), // Negative for usage/consumption
        transactionType: transactionType || 'USAGE',
        notes: notes || `Ingredient used in order processing`,
        orderId: orderId || null,
        createdBy: session.user.id,
      },
    });

    // Update ingredient stock level
    await prisma.inventoryItem.update({
      where: { id: ingredientId },
      data: {
        currentStock: {
          decrement: Math.abs(quantity),
        },
        lastUpdated: new Date(),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: usageLog,
      message: 'Ingredient usage logged successfully',
    });
  } catch (error) {
    console.error('Error logging ingredient usage:', error);
    return NextResponse.json(
      { error: 'Failed to log ingredient usage' },
      { status: 500 }
    );
  }
}