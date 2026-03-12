import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/wallet - Get merchant wallet balance and details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      // Get or create wallet for the store
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/wallet`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch wallet" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch wallet" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[WALLET_GET_ERROR] Failed to fetch wallet", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch wallet" },
        { status: 500 }
      );
    }
  }
);

// POST /api/wallet/fund - Add funds to wallet (manual/admin)
export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { amount, method, reference, metadata } = body;

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, error: "Valid amount is required" },
          { status: 400 }
        );
      }

      // Forward to Backend API to fund wallet
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/wallet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({ amount, method, reference, metadata }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fund wallet" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fund wallet" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[WALLET_POST_ERROR] Failed to fund wallet", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fund wallet" },
        { status: 500 }
      );
    }
  }
);
