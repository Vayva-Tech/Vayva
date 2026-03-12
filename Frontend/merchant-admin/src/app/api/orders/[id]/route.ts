import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/orders/[id] - Get single order details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/orders/${id}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch order" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch order" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[ORDER_GET_ERROR] Failed to fetch order", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch order" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/orders/[id] - Update order
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { status, paymentStatus, note, shippingAddress } = body;

      // Forward to Backend API to update order
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/orders/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(body),
        }
      );

      if (!backendResponse.ok) {
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to update order" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to update order" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[ORDER_PATCH_ERROR] Failed to update order", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update order" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/orders/[id] - Delete order
export const DELETE = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;

      // Forward to Backend API to delete order
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/orders/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to delete order" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to delete order" },
          { status: (backendResponse as any).status }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[ORDER_DELETE_ERROR] Failed to delete order", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to delete order" },
        { status: 500 }
      );
    }
  }
);
