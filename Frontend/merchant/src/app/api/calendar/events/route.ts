// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/calendar/events - Get all calendar events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

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
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/calendar/events",
      operation: "GET_CALENDAR_EVENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
