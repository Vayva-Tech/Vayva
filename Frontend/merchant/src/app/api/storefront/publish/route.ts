import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/storefront/publish
 * Publish storefront with selected template
 */
export async function POST(request: NextRequest) {
  try {
    const validated = await request.json().catch(() => ({}));

    // Call backend API using apiJson to publish storefront
    const result = await apiJson<{
      success: boolean;
      data?: { deployment?: any; message?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/storefront/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to publish storefront');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/storefront/publish',
        operation: 'PUBLISH_STOREFRONT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to publish storefront' },
      { status: 500 }
    );
  }
}
