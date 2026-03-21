import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

async function handler(request: NextRequest) {
  try {
    // Fetch extensions via backend API
    const result = await apiJson<{
      success: boolean;
      data?: { extensions?: any[] };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/control-center/extensions`, {
      headers: {
        'x-store-id': request.headers.get('x-store-id') || '',
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch extensions');
    }

    return NextResponse.json({
      extensions: result.data?.extensions || [],
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/control-center/extensions',
        operation: 'GET_EXTENSIONS',
      }
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = handler;
