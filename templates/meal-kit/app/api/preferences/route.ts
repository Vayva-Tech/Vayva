// ============================================================================
// Customer Meal Preferences API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/preferences - Get customer preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const customerId = searchParams.get('customerId');

    if (!storeId || !customerId) {
      return NextResponse.json(
        { error: 'storeId and customerId are required' },
        { status: 400 }
      );
    }

    const preferences = await prisma.customerMealPreference.findUnique({
      where: {
        storeId_customerId: {
          storeId,
          customerId,
        },
      },
    });

    return NextResponse.json(preferences || {
      dislikes: [],
      allergies: [],
      dietaryType: null,
      spiceLevel: 'medium',
      notes: null,
    });
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// POST /api/preferences - Create or update preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      customerId,
      dislikes,
      allergies,
      dietaryType,
      spiceLevel,
      notes,
    } = body;

    // Validate required fields
    if (!storeId || !customerId) {
      return NextResponse.json(
        { error: 'storeId and customerId are required' },
        { status: 400 }
      );
    }

    const preferences = await prisma.customerMealPreference.upsert({
      where: {
        storeId_customerId: {
          storeId,
          customerId,
        },
      },
      update: {
        dislikes: dislikes || [],
        allergies: allergies || [],
        dietaryType,
        spiceLevel: spiceLevel || 'medium',
        notes,
      },
      create: {
        storeId,
        customerId,
        dislikes: dislikes || [],
        allergies: allergies || [],
        dietaryType,
        spiceLevel: spiceLevel || 'medium',
        notes,
      },
    });

    return NextResponse.json(preferences, { status: 201 });
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// DELETE /api/preferences - Delete preferences
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const customerId = searchParams.get('customerId');

    if (!storeId || !customerId) {
      return NextResponse.json(
        { error: 'storeId and customerId are required' },
        { status: 400 }
      );
    }

    await prisma.customerMealPreference.delete({
      where: {
        storeId_customerId: {
          storeId,
          customerId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete preferences:', error);
    return NextResponse.json(
      { error: 'Failed to delete preferences' },
      { status: 500 }
    );
  }
}
