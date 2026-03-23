// @ts-nocheck
import { logger } from "@vayva/shared";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/loyalty/rewards - Get loyalty rewards
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const isActive = searchParams.get("isActive");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    // Fetch loyalty rewards via API
    const queryParams = new URLSearchParams({ storeId, limit: String(limit), offset: String(offset) });
    if (isActive) queryParams.append('isActive', isActive);

    const result = await apiJson<{
      success: boolean;
      data?: { rewards?: any[]; total?: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/loyalty/rewards?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch loyalty rewards');
    }

    return NextResponse.json({ rewards: result.data?.rewards || [], total: result.data?.total || 0 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/loyalty/rewards",
        operation: "FETCH_LOYALTY_REWARDS",
      }
    );
    return NextResponse.json({ error: "Failed to fetch loyalty rewards" }, { status: 500 });
  }
}

// POST /api/loyalty/rewards - Create loyalty reward
export async function POST(req: Request) {
  let body: { storeId?: string; name?: string; description?: string; pointsCost?: number; type?: string; value?: number; isActive?: boolean } = {};
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    body = await req.json();
    const { storeId, ...input } = body;

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const reward = await LoyaltyService.createReward(storeId, input as any);
    return NextResponse.json({ reward });
  } catch (error) {
    logger.error("[LOYALTY_REWARDS_POST] Failed to create loyalty reward", { storeId: body?.storeId, error });
    return NextResponse.json({ error: "Failed to create loyalty reward" }, { status: 500 });
  }
}
