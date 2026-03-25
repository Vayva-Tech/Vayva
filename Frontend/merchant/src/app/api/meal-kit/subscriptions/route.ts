// ============================================================================
// Meal Kit Subscriptions API Route - Merchant Admin
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/meal-kit/subscriptions - List all subscriptions for a store
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

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
      headers: auth.headers,
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
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const {
      storeId: _bodyStoreId,
      customerId,
      planType,
      portionsPerMeal,
      mealsPerWeek,
      nextDelivery,
      preferences,
    } = body;

    // Validate required fields
    if (!customerId || !planType || !nextDelivery) {
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
      headers: { ...auth.headers },
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
