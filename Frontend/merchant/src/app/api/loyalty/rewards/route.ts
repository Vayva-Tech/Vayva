import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { LoyaltyService } from "@/services/loyalty.service";
import type { CreateLoyaltyRewardInput, RewardType } from "@/types/phase1-commerce";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

const REWARD_TYPES: RewardType[] = [
  "discount",
  "free_product",
  "free_shipping",
  "cash",
];

function isRewardType(v: string): v is RewardType {
  return (REWARD_TYPES as string[]).includes(v);
}

// GET /api/loyalty/rewards - Get loyalty rewards
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const queryParams = new URLSearchParams({
      storeId,
      limit: String(limit),
      offset: String(offset),
    });
    if (isActive) queryParams.append("isActive", isActive);

    const result = await apiJson<{
      success: boolean;
      data?: { rewards?: unknown[]; total?: number };
      error?: string;
    }>(`${backendBase()}/api/loyalty/rewards?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch loyalty rewards");
    }

    const rewards = Array.isArray(result.data?.rewards) ? result.data.rewards : [];
    const total =
      typeof result.data?.total === "number" ? result.data.total : rewards.length;

    return NextResponse.json({ rewards, total });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/loyalty/rewards",
      operation: "FETCH_LOYALTY_REWARDS",
    });
    return NextResponse.json({ error: "Failed to fetch loyalty rewards" }, { status: 500 });
  }
}

// POST /api/loyalty/rewards - Create loyalty reward
export async function POST(request: NextRequest) {
  let sessionStoreId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    sessionStoreId = auth.user.storeId;

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;

    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const pointRaw = b.pointsCost ?? b.pointCost;
    const pointCost =
      typeof pointRaw === "number"
        ? pointRaw
        : typeof pointRaw === "string"
          ? Number(pointRaw)
          : NaN;
    if (!Number.isFinite(pointCost) || pointCost <= 0) {
      return NextResponse.json({ error: "valid pointsCost is required" }, { status: 400 });
    }

    const typeRaw =
      typeof b.rewardType === "string"
        ? b.rewardType
        : typeof b.type === "string"
          ? b.type
          : "";
    if (!isRewardType(typeRaw)) {
      return NextResponse.json({ error: "valid reward type is required" }, { status: 400 });
    }

    const valueRaw = b.value ?? b.rewardValue;
    const rewardValue =
      typeof valueRaw === "number"
        ? valueRaw
        : typeof valueRaw === "string"
          ? Number(valueRaw)
          : undefined;

    const input: CreateLoyaltyRewardInput = {
      name,
      description:
        typeof b.description === "string" ? b.description : undefined,
      pointCost,
      rewardType: typeRaw,
      rewardValue:
        rewardValue !== undefined && Number.isFinite(rewardValue)
          ? rewardValue
          : undefined,
      productId: typeof b.productId === "string" ? b.productId : undefined,
      maxRedemptions:
        typeof b.maxRedemptions === "number" ? b.maxRedemptions : undefined,
      startDate: typeof b.startDate === "string" ? b.startDate : undefined,
      endDate: typeof b.endDate === "string" ? b.endDate : undefined,
    };

    const reward = await LoyaltyService.createReward(sessionStoreId, input);
    return NextResponse.json({ reward });
  } catch (error) {
    logger.error(
      "[LOYALTY_REWARDS_POST] Failed to create loyalty reward",
      ErrorCategory.API,
      error,
      { storeId: sessionStoreId }
    );
    return NextResponse.json({ error: "Failed to create loyalty reward" }, { status: 500 });
  }
}
