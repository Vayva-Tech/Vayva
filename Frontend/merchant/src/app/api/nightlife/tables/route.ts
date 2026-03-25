import { NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/nightlife/tables?venueId=xxx&date=xxx&capacity=xxx
 * List tables with availability
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const date = searchParams.get("date");
    const capacity = searchParams.get("capacity");
    const tableType = searchParams.get("tableType");

    if (!venueId) {
      return NextResponse.json(
        { error: "Venue ID required" },
        { status: 400 }
      );
    }

    // Build query params for API call
    const queryParams = new URLSearchParams({
      venueId,
    });
    
    if (date) queryParams.append('date', date);
    if (capacity) queryParams.append('capacity', capacity);
    if (tableType) queryParams.append('tableType', tableType);

    // Fetch tables via backend API
    const result = await apiJson<{
      success: boolean;
      data?: { tables?: any[] };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nightlife/tables?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tables');
    }

    return NextResponse.json({ tables: result.data?.tables || [] });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/nightlife/tables',
        operation: 'GET_NIGHTLIFE_TABLES',
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}
