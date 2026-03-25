import { NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/nightlife/guestlist?venueId=xxx&date=xxx&status=xxx
 * List guest list entries
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const guestType = searchParams.get("guestType");

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
    if (status) queryParams.append('status', status);
    if (guestType) queryParams.append('guestType', guestType);

    // Fetch guestlist via backend API
    const result = await apiJson<{
      success: boolean;
      data?: { guests?: any[]; stats?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nightlife/guestlist?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch guest list');
    }

    return NextResponse.json({ 
      guests: result.data?.guests || [],
      stats: result.data?.stats 
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/nightlife/guestlist',
        operation: 'GET_NIGHTLIFE_GUESTLIST',
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch guest list" },
      { status: 500 }
    );
  }
}
