import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/refunds - Get all refunds for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/refunds?status=${status || ""}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch refunds" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch refunds" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[REFUNDS_GET_ERROR] Failed to fetch refunds", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch refunds" },
        { status: 500 }
      );
    }
  }
);

// POST /api/refunds - Create a new refund request
export const POST = withVayvaAPI(
  PERMISSIONS.REFUNDS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        orderId,
        amount,
        reason,
        reasonCategory,
        items,
        notes,
      } = body;

      if (!orderId || !amount) {
        return NextResponse.json(
          { success: false, error: "Order ID and amount are required" },
          { status: 400 }
        );
      }

      // Forward to Backend API to create refund
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/refunds`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            orderId,
            amount,
            reason,
            reasonCategory,
            items,
            notes,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create refund" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create refund" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[REFUNDS_POST_ERROR] Failed to create refund", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create refund" },
        { status: 500 }
      );
    }
  }
);
