// ============================================================================
// Customer Meal Preferences API Route - Merchant Admin
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/meal-kit/preferences - Get customer preferences
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

    // Call backend API instead of direct Prisma query
    const result = await apiJson<{
      success: boolean;
      data?: {
        dislikes: string[];
        allergies: string[];
        dietaryType: string | null;
        spiceLevel: string;
        notes: string | null;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/meal-kit/preferences?storeId=${storeId}&customerId=${customerId}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/meal-kit/preferences",
        operation: "GET_PREFERENCES",
      }
    );
    throw error;
  }
}

// POST /api/meal-kit/preferences - Create or update preferences
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

    // Call backend API to create/update preferences
    const result = await apiJson<{
      success: boolean;
      data?: {
        id: string;
        storeId: string;
        customerId: string;
        dislikes: string[];
        allergies: string[];
        dietaryType: string | null;
        spiceLevel: string;
        notes: string | null;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/meal-kit/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify({
        customerId,
        dislikes: dislikes || [],
        allergies: allergies || [],
        dietaryType,
        spiceLevel: spiceLevel || 'medium',
        notes,
      }),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/meal-kit/preferences",
        operation: "SAVE_PREFERENCES",
      }
    );
    throw error;
  }
}