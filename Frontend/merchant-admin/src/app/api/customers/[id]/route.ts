import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/customers/[id] - Get single customer details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;

      // Forward to Backend API to get customer
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/customers/${id}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Customer not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch customer" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch customer" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();

      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[CUSTOMER_GET_ERROR] Failed to fetch customer", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch customer" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/customers/[id] - Update customer
export const PATCH = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        country,
        tags,
      } = body;

      // Forward to Backend API to update customer
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/customers/${id}`,
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
            { success: false, error: "Customer not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to update customer" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to update customer" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[CUSTOMER_PATCH_ERROR] Failed to update customer", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update customer" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/customers/[id] - Delete customer
export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;

      // Forward to Backend API to delete customer
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/customers/${id}`,
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
            { success: false, error: "Customer not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to delete customer" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to delete customer" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[CUSTOMER_DELETE_ERROR] Failed to delete customer", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to delete customer" },
        { status: 500 }
      );
    }
  }
);
