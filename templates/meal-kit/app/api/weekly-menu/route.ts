// ============================================================================
// Weekly Menu API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/weekly-menu - Get weekly menu
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const weekStart = searchParams.get('weekStart');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    const where: any = { storeId, isActive: true };

    if (weekStart) {
      where.weekStartDate = new Date(weekStart);
    } else {
      // Get current week's menu by default
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      where.weekStartDate = {
        gte: startOfWeek,
      };
    }

    const weeklyMenu = await prisma.weeklyMenu.findFirst({
      where,
      orderBy: { weekStartDate: 'desc' },
    });

    return NextResponse.json(weeklyMenu || { recipes: [] });
  } catch (error) {
    console.error('Failed to fetch weekly menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly menu' },
      { status: 500 }
    );
  }
}

// POST /api/weekly-menu - Create or update weekly menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      weekStartDate,
      weekEndDate,
      recipes,
    } = body;

    // Validate required fields
    if (!storeId || !weekStartDate || !weekEndDate || !recipes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert weekly menu
    const weeklyMenu = await prisma.weeklyMenu.upsert({
      where: {
        storeId_weekStartDate: {
          storeId,
          weekStartDate: new Date(weekStartDate),
        },
      },
      update: {
        weekEndDate: new Date(weekEndDate),
        recipes,
      },
      create: {
        storeId,
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        recipes,
      },
    });

    return NextResponse.json(weeklyMenu, { status: 201 });
  } catch (error) {
    console.error('Failed to save weekly menu:', error);
    return NextResponse.json(
      { error: 'Failed to save weekly menu' },
      { status: 500 }
    );
  }
}

// DELETE /api/weekly-menu - Delete weekly menu
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const weekStart = searchParams.get('weekStart');

    if (!storeId || !weekStart) {
      return NextResponse.json(
        { error: 'storeId and weekStart are required' },
        { status: 400 }
      );
    }

    await prisma.weeklyMenu.delete({
      where: {
        storeId_weekStartDate: {
          storeId,
          weekStartDate: new Date(weekStart),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete weekly menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly menu' },
      { status: 500 }
    );
  }
}
