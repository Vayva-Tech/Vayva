import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/support/tickets - Get all support tickets
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const priority = searchParams.get("priority");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      const where: Record<string, unknown> = { storeId };
      if (status) {where.status = status;
      }
      if (priority) {
        where.priority = priority;
      }

      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      if (priority) queryParams.set("priority", priority);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/support/tickets?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch tickets" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch tickets" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[TICKETS_GET_ERROR] Failed to fetch tickets", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch tickets" },
        { status: 500 }
      );
    }
  }
);

// POST /api/support/tickets - Create a new support ticket
export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        customerId,
        subject,
        description,
        priority,
        category,
      } = body;

      // Forward to Backend API to create ticket
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/support/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            customerId,
            subject,
            description,
            priority,
            category,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create ticket" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create ticket" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[TICKETS_POST_ERROR] Failed to create ticket", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create ticket" },
        { status: 500 }
      );
    }
  }
);
