import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/calendar/events - Get all calendar events
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query params
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.set("dateFrom", dateFrom);
      if (dateTo) queryParams.set("dateTo", dateTo);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/calendar/events?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch events" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch events" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[EVENTS_GET_ERROR] Failed to fetch events", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch events" },
        { status: 500 }
      );
    }
  }
);

// POST /api/calendar/events - Create a new calendar event
export const POST = withVayvaAPI(
  PERMISSIONS.COMMERCE_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        startTime,
        endTime,
        type,
        bookingId,
        customerId,
        staffId,
        location,
        color,
      } = body;

      if (!title || !startTime) {
        return NextResponse.json(
          { success: false, error: "Title and start time are required" },
          { status: 400 }
        );
      }

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/calendar/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            title,
            description,
            startTime,
            endTime,
            type,
            bookingId,
            customerId,
            staffId,
            location,
            color,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to create event" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to create event" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[EVENTS_POST_ERROR] Failed to create event", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create event" },
        { status: 500 }
      );
    }
  }
);
