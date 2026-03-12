import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// POST /api/billing/verify-payment - Verify payment and update subscription
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { reference } = body;

      if (!reference) {
        return NextResponse.json(
          { success: false, error: "Payment reference is required" },
          { status: 400 }
        );
      }

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/billing/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({ reference }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to verify payment" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to verify payment" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[BILLING_VERIFY_PAYMENT_ERROR] Failed to verify payment", { error: error instanceof Error ? error.message : String(error), storeId, userId: user?.id });
      return NextResponse.json(
        { success: false, error: "Failed to verify payment" },
        { status: 500 }
      );
    }
  }
);
