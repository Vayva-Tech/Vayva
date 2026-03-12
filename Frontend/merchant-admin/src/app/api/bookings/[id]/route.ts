import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/bookings/[id] - Get single booking details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/bookings/${id}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Booking not found" }));
        return NextResponse.json(
          { success: false, error: error.error || "Booking not found" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data });
    } catch (error: unknown) {
      logger.error("[BOOKING_GET_ERROR] Failed to fetch booking", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch booking" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/bookings/[id] - Update booking
export const PATCH = withVayvaAPI(
  PERMISSIONS.COMMERCE_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const {
        status,
        bookingDate,
        startTime,
        endTime,
        staffId,
        notes,
      } = body;

      // Forward to Backend API to update booking
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/bookings/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            status,
            bookingDate,
            startTime,
            endTime,
            staffId,
            notes,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to update booking" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to update booking" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data });
    } catch (error: unknown) {
      logger.error("[BOOKING_PATCH_ERROR] Failed to update booking", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update booking" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/bookings/[id] - Delete/cancel booking
export const DELETE = withVayvaAPI(
  PERMISSIONS.COMMERCE_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;

      // Forward to Backend API to cancel booking
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to cancel booking" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to cancel booking" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({
        success: true,
        data: data.data,
        message: "Booking cancelled successfully",
      });
    } catch (error: unknown) {
      logger.error("[BOOKING_DELETE_ERROR] Failed to cancel booking", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to cancel booking" },
        { status: 500 }
      );
    }
  }
);
