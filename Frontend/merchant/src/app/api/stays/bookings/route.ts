import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/stays/bookings?storeId=xxx&status=xxx&start=xxx&end=xxx
 * List bookings for a store
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const accommodationId = searchParams.get("accommodationId");

    // Call backend API to fetch bookings
    const result = await apiJson<{
      bookings: Array<{
        id: string;
        accommodationId: string;
        customerId: string;
        checkIn: Date;
        checkOut: Date;
        status: string;
        guests: number;
      }>;
      total: number;
    }>(
      `${process.env.BACKEND_API_URL}/api/stays/bookings?storeId=${encodeURIComponent(storeId)}&status=${status || ''}&start=${start || ''}&end=${end || ''}&accommodationId=${accommodationId || ''}`,
      {
        headers: auth.headers,
      },
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/stays/bookings",
        operation: "GET_BOOKINGS",
        storeId: undefined,
      }
    );
    throw error;
  }
}
