import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoyaltyService } from "@/services/loyalty.service";
import { logger } from "@/lib/logger";

// GET /api/loyalty/customer/:customerId - Get customer loyalty
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  let storeId: string | null = null;
  let customerId: string | undefined;
  try {
    customerId = (await params).customerId;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const loyalty = await LoyaltyService.getCustomerLoyalty(storeId, customerId);
    if (!loyalty) {
      return NextResponse.json({ error: "Customer loyalty not found" }, { status: 404 });
    }

    return NextResponse.json({ loyalty });
  } catch (error) {
    logger.error("[LOYALTY_CUSTOMER_GET] Failed to fetch customer loyalty", { storeId, customerId, error });
    return NextResponse.json(
      { error: "Failed to fetch customer loyalty" },
      { status: 500 }
    );
  }
}

// POST /api/loyalty/customer/:customerId/earn - Earn points
export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  let storeId: string | undefined;
  let customerId: string | undefined;
  try {
    customerId = (await params).customerId;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    storeId = body.storeId;
    const { points, orderId, description } = body;

    if (!storeId || !points) {
      return NextResponse.json({ error: "storeId and points required" }, { status: 400 });
    }

    const loyalty = await LoyaltyService.earnPoints(
      storeId,
      customerId,
      points,
      orderId,
      description
    );

    return NextResponse.json({ loyalty });
  } catch (error) {
    logger.error("[LOYALTY_EARN_POST] Failed to earn points", { storeId, customerId, error });
    return NextResponse.json(
      { error: "Failed to earn points" },
      { status: 500 }
    );
  }
}
