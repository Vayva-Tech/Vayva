import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/stays/availability?accommodationId=xxx&start=2024-01-01&end=2024-01-31
 * Get availability calendar for an accommodation
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get("accommodationId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!accommodationId) {
      return NextResponse.json(
        { error: "Accommodation ID required" },
        { status: 400 }
      );
    }

    // Call backend API to fetch availability
    const result = await apiJson<{
      availability: Array<{
        date: string;
        isAvailable: boolean;
        price: number;
        minimumStay: number;
      }>;
      accommodation: { id: string; name: string };
    }>(
      `${process.env.BACKEND_API_URL}/api/stays/availability?accommodationId=${accommodationId}&start=${start || ''}&end=${end || ''}`,
      {
        headers: auth.headers,
      },
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/stays/availability",
        operation: "GET_AVAILABILITY",
        storeId: undefined,
      }
    );
    throw error;
  }
}
