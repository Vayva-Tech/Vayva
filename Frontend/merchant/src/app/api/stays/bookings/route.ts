import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/stays/bookings?storeId=xxx&status=xxx&start=xxx&end=xxx
 * List bookings for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
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
      `${process.env.BACKEND_API_URL}/api/stays/bookings?storeId=${storeId || ''}&status=${status || ''}&start=${start || ''}&end=${end || ''}&accommodationId=${accommodationId || ''}`,
      {
        headers: {},
      }
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/stays/bookings",
        operation: "GET_BOOKINGS",
        storeId: undefined,
      }
    );
    throw error;
  }
}
