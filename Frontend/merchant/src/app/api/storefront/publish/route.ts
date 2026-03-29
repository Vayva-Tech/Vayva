import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

/**
 * POST /api/storefront/publish
 * Publish storefront with selected template
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const validated = await request.json().catch(() => ({}));

    // Call backend API using apiJson to publish storefront
    const result = await apiJson<{
      success: boolean;
      data?: { deployment?: any; message?: string };
      error?: string;
    }>(buildBackendUrl("/storefront/publish"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth.headers,
      },
      body: JSON.stringify(validated),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to publish storefront');
    }

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
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
