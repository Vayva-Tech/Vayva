import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/socials/instagram/disconnect
 * Disconnect Instagram account
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/socials/instagram/disconnect`, {
      method: "POST",
      headers: { ...auth.headers },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to disconnect Instagram');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/socials/instagram/disconnect',
        operation: 'DISCONNECT_INSTAGRAM',
      }
    );
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram' },
      { status: 500 }
    );
  }
}
