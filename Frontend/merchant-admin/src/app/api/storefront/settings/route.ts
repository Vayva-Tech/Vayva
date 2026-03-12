import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/storefront/settings - Get storefront settings
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/storefront/settings`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch settings" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch settings" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[STOREFRONT_SETTINGS_GET_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch storefront settings" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/storefront/settings - Update storefront settings
export const PUT = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/storefront/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(body),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to update settings" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to update settings" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[STOREFRONT_SETTINGS_PUT_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update storefront settings" },
        { status: 500 }
      );
    }
  }
);
