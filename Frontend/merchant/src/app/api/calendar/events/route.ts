import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/calendar/events - Get all calendar events
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    const queryParams = new URLSearchParams();
    if (dateFrom) queryParams.set("dateFrom", dateFrom);
    if (dateTo) queryParams.set("dateTo", dateTo);
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    const result = await apiJson<{
      success: boolean;
      data?: Array<{ id: string; title: string; start: string; end: string; allDay: boolean }>;
      meta?: { total: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/calendar/events?${queryParams.toString()}`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/calendar/events",
      operation: "GET_CALENDAR_EVENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}
