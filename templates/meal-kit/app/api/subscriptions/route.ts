// ============================================================================
// Meal Kit Subscriptions API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/subscriptions - List all subscriptions for a store
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    const where: any = { storeId };

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.mealKitSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      customerId,
      planType,
      portionsPerMeal,
      mealsPerWeek,
      nextDelivery,
      preferences,
    } = body;

    // Validate required fields
    if (!storeId || !customerId || !planType || !nextDelivery) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await prisma.mealKitSubscription.create({
      data: {
        storeId,
        customerId,
        planType,
        portionsPerMeal: portionsPerMeal || 4,
        mealsPerWeek: mealsPerWeek || 3,
        nextDelivery: new Date(nextDelivery),
        preferences: preferences || {},
        skipWeeks: [],
        status: 'active',
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
