import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/billing/upgrade - Get upgrade options and current billing status
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/billing/upgrade`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch billing upgrade options" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch billing upgrade options" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[BILLING_UPGRADE_GET_ERROR] Failed to fetch billing upgrade options", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch billing upgrade options" },
        { status: 500 }
      );
    }
  }
);

// POST /api/billing/upgrade - Initiate plan upgrade
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { plan } = body;

      if (!plan) {
        return NextResponse.json(
          { success: false, error: "Plan is required" },
          { status: 400 }
        );
      }

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/billing/upgrade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({ plan }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to initiate upgrade" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to initiate upgrade" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[BILLING_UPGRADE_POST_ERROR] Failed to initiate upgrade", { error: error instanceof Error ? error.message : String(error), storeId, userId: user?.id });
      return NextResponse.json(
        { success: false, error: "Failed to initiate upgrade" },
        { status: 500 }
      );
    }
  }
);
