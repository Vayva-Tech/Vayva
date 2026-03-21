// ============================================================================
// Inventory Check API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/inventory/check - Check inventory levels
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const weekStart = searchParams.get('weekStart');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    // Get active subscriptions for the week
    const where: any = { storeId, status: 'active' };
    
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      
      where.nextDelivery = {
        gte: startDate,
        lte: endDate,
      };
    }

    const subscriptions = await prisma.mealKitSubscription.findMany({
      where,
    });

    // Get weekly menu
    const weeklyMenu = await prisma.weeklyMenu.findFirst({
      where: {
        storeId,
        weekStartDate: weekStart ? new Date(weekStart) : new Date(),
        isActive: true,
      },
    });

    if (!weeklyMenu) {
      return NextResponse.json([]);
    }

    const recipes = (weeklyMenu.recipes as any[]) || [];
    
    // Aggregate ingredient requirements (simplified)
    const ingredientRequirements = recipes.map(recipe => ({
      productId: recipe.recipeId,
      productName: recipe.name,
      requiredQuantity: subscriptions.length * 100, // Simplified calculation
      currentStock: 0,
      unit: 'g',
      lowStockThreshold: 50,
    }));

    return NextResponse.json(ingredientRequirements);
  } catch (error) {
    console.error('Failed to check inventory:', error);
    return NextResponse.json(
      { error: 'Failed to check inventory' },
      { status: 500 }
    );
  }
}
