import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/leads - Get all leads for the merchant
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
        `${process?.env?.BACKEND_API_URL}/api/leads?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch leads" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch leads" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[LEADS_GET_ERROR] Failed to fetch leads", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch leads" },
        { status: 500 }
      );
    }
  }
);

// POST /api/leads - Create a new lead
export const POST = withVayvaAPI(
  PERMISSIONS.KYC_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        name,
        email,
        phone,
        company,
        source,
        status,
        value,
        notes,
      } = body;

      // Forward to Backend API to create lead
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/leads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            company,
            source,
            status,
            value,
            notes,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create lead" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create lead" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[LEADS_POST_ERROR] Failed to create lead", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create lead" },
        { status: 500 }
      );
    }
  }
);
