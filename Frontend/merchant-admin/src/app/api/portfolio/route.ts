import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/portfolio - Get all portfolio items for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/portfolio?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch portfolio" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch portfolio" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PORTFOLIO_GET_ERROR] Failed to fetch portfolio", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch portfolio items" },
        { status: 500 }
      );
    }
  }
);

// POST /api/portfolio - Create a new portfolio item
export const POST = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        category,
        clientName,
        completionDate,
        budget,
        status,
        images,
        tags,
        featured,
      } = body;

      // Forward to Backend API to create portfolio item
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/portfolio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            title,
            description,
            category,
            clientName,
            completionDate,
            budget,
            status,
            images,
            tags,
            featured,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create portfolio item" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create portfolio item" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[PORTFOLIO_POST_ERROR] Failed to create portfolio item", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create portfolio item" },
        { status: 500 }
      );
    }
  }
);
