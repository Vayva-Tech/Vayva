import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/marketing/affiliates
 * Fetch affiliate marketing data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketing/affiliates?limit=${limit}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch affiliates');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/marketing/affiliates',
        operation: 'GET_AFFILIATES',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/affiliates
 * Create or manage affiliate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketing/affiliates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to manage affiliate');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/marketing/affiliates',
        operation: 'MANAGE_AFFILIATE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to manage affiliate' },
      { status: 500 }
    );
  }
}
