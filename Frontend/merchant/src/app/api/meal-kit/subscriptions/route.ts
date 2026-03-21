// ============================================================================
// Meal Kit Subscriptions API Route - Merchant Admin
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/meal-kit/subscriptions - List all subscriptions for a store
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set('storeId', storeId);
    if (customerId) queryParams.set('customerId', customerId);
    if (status) queryParams.set('status', status);

    // Call backend API instead of direct Prisma query
    const result = await apiJson<{
      success: boolean;
      data?: Array<{
        id: string;
        customerId: string;
        planId: string;
        status: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
      }>;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/meal-kit/subscriptions?${queryParams.toString()}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/meal-kit/subscriptions",
        operation: "GET_SUBSCRIPTIONS",
      }
    );
    throw error;
  }
}

// POST /api/meal-kit/subscriptions - Create new subscription
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

    // Call backend API to create subscription
    const result = await apiJson<{
      success: boolean;
      data?: {
        id: string;
        customerId: string;
        planType: string;
        status: string;
        nextDelivery: Date;
        createdAt: Date;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/meal-kit/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify({
        customerId,
        planType,
        portionsPerMeal: portionsPerMeal || 4,
        mealsPerWeek: mealsPerWeek || 3,
        nextDelivery,
        preferences: preferences || {},
      }),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/meal-kit/subscriptions",
        operation: "CREATE_SUBSCRIPTION",
      }
    );
    throw error;
  }
}
