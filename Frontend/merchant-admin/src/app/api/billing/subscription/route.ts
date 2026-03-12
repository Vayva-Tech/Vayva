import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/billing/subscription - Get subscription status and plans
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/billing/subscription`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch subscription" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch subscription" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[BILLING_SUBSCRIPTION_GET_ERROR] Failed to fetch subscription", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch subscription" },
        { status: 500 }
      );
    }
  }
);

// POST /api/billing/subscription - Create or update subscription
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { newPlan } = body;

      if (!newPlan) {
        return NextResponse.json(
          { success: false, error: "Plan is required" },
          { status: 400 }
        );
      }

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/billing/subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({ newPlan }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to update subscription" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to update subscription" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[BILLING_SUBSCRIPTION_POST_ERROR] Failed to update subscription", { error: error instanceof Error ? error.message : String(error), storeId, userId: user?.id });
      return NextResponse.json(
        { success: false, error: "Failed to update subscription" },
        { status: 500 }
      );
    }
  }
);
