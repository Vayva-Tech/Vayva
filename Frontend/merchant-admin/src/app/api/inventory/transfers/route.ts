import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/inventory/transfers - Get stock transfers
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/inventory/transfers`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch transfers" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch transfers" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[INVENTORY_TRANSFERS_GET_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch stock transfers" },
        { status: 500 }
      );
    }
  }
);

// POST /api/inventory/transfers - Create stock transfer
export const POST = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/inventory/transfers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(body),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create transfer" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create transfer" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[INVENTORY_TRANSFERS_POST_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create stock transfer" },
        { status: 500 }
      );
    }
  }
);
