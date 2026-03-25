import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { LoyaltyService } from "@/services/loyalty.service";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/loyalty/customer/:customerId - Get customer loyalty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  let customerId: string | undefined;
  try {
    const resolved = await params;
    customerId = resolved.customerId;
    if (!customerId || !customerId.trim()) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(
      `${backendBase()}/api/loyalty/customer/${encodeURIComponent(customerId)}?storeId=${encodeURIComponent(storeId)}`,
      {
        headers: auth.headers,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Customer loyalty not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ loyalty: result.data });
  } catch (error) {
    handleApiError(error, {
      endpoint: `/api/loyalty/customer/[customerId]`,
      operation: "FETCH_CUSTOMER_LOYALTY",
    });
    return NextResponse.json(
      { error: "Failed to fetch customer loyalty" },
      { status: 500 }
    );
  }
}

// POST /api/loyalty/customer/:customerId/earn - Earn points
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  let storeId: string | undefined;
  let customerId: string | undefined;
  try {
    const resolved = await params;
    customerId = resolved.customerId;
    if (!customerId || !customerId.trim()) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const points = b.points;
    const orderId = typeof b.orderId === "string" ? b.orderId : undefined;
    const description =
      typeof b.description === "string" ? b.description : undefined;

    const pointsNum =
      typeof points === "number" ? points : typeof points === "string" ? Number(points) : NaN;
    if (!Number.isFinite(pointsNum)) {
      return NextResponse.json({ error: "points required" }, { status: 400 });
    }

    const loyalty = await LoyaltyService.earnPoints(
      storeId,
      customerId,
      pointsNum,
      orderId,
      description
    );

    return NextResponse.json({ loyalty });
  } catch (error) {
    logger.error(
      "[LOYALTY_EARN_POST] Failed to earn points",
      ErrorCategory.API,
      error,
      { storeId, customerId }
    );
    return NextResponse.json({ error: "Failed to earn points" }, { status: 500 });
  }
}
