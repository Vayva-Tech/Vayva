// ============================================================================
// Customer Meal Preferences API Route - Merchant Admin
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/meal-kit/preferences - Get customer preferences
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
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
    }>(`${process.env.BACKEND_API_URL}/api/meal-kit/preferences?storeId=${encodeURIComponent(storeId)}&customerId=${encodeURIComponent(customerId)}`, {
      headers: auth.headers,
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
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const {
      storeId: _bodyStoreId,
      customerId,
      dislikes,
      allergies,
      dietaryType,
      spiceLevel,
      notes,
    } = body;

    // Validate required fields
    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
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
      headers: { ...auth.headers },
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