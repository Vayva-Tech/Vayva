import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

/**
 * GET /api/storefront/draft
 * Get the current storefront draft
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{ found: boolean; draft?: unknown }>(
      buildBackendUrl("/storefront/draft"),
      { headers: auth.headers, cache: "no-store" },
    );

    if (!result?.found) {
      return NextResponse.json(
        { draft: null },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { draft: result.draft ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/storefront/draft',
      operation: 'GET_DRAFT',
    });
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/storefront/draft
 * Save storefront draft
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    
    const result = await apiJson<{ success: boolean; draft?: unknown }>(buildBackendUrl("/storefront/draft"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth.headers,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/storefront/draft',
      operation: 'SAVE_DRAFT',
    });
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/storefront/draft
 * Partial update for autosave (theme editor)
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    const result = await apiJson<{ success: boolean; draft?: unknown }>(
      buildBackendUrl("/storefront/draft"),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...auth.headers,
        },
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/storefront/draft",
      operation: "PATCH_DRAFT",
    });
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 },
    );
  }
}
