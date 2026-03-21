// ============================================================================
// Recipes API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/recipes - Get recipes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const weekStart = searchParams.get('weekStart');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    const where: any = { storeId, isAvailable: true };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // If weekStart is provided, get recipes from that week's menu
    if (weekStart) {
      const weeklyMenu = await prisma.weeklyMenu.findFirst({
        where: {
          storeId,
          weekStartDate: new Date(weekStart),
          isActive: true,
        },
      });

      if (weeklyMenu) {
        const recipeIds = (weeklyMenu.recipes as any[]).map(r => r.recipeId);
        where.id = { in: recipeIds };
      } else {
        return NextResponse.json([]);
      }
    }

    const recipes = await prisma.mealKitRecipe.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      name,
      description,
      category,
      difficulty,
      prepTime,
      cookTime,
      servings,
      calories,
      ingredients,
      instructions,
      imageUrl,
      tags,
    } = body;

    // Validate required fields
    if (!storeId || !name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recipe = await prisma.mealKitRecipe.create({
      data: {
        storeId,
        name,
        description,
        category,
        difficulty: difficulty || 'medium',
        prepTime: prepTime || 15,
        cookTime: cookTime || 30,
        servings: servings || 4,
        calories,
        ingredients: ingredients || [],
        instructions: instructions || [],
        imageUrl,
        tags: tags || [],
        isAvailable: true,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Failed to create recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

// PUT /api/recipes - Update recipe
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const body = await request.json();

    const recipe = await prisma.mealKitRecipe.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Failed to update recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes - Delete recipe
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    await prisma.mealKitRecipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
