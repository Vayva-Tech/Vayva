import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ReturnService } from "@/services/return.service";

// GET /api/returns/requests - Get return requests
export async function GET(req: Request) {
  let storeId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const { returns, total } = await ReturnService.getReturnRequests(storeId, {
      status: status as any,
      customerId: customerId || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ returns, total });
  } catch (error) {
    logger.error("[RETURNS_REQUESTS_GET] Failed to fetch return requests", { storeId, error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/returns/requests - Create return request
export async function POST(req: Request) {
  let storeId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    storeId = body.storeId;
    const { merchantId, ...input } = body;

    if (!storeId || !merchantId) {
      return NextResponse.json({ error: "storeId and merchantId required" }, { status: 400 });
    }

    const returnRequest = await ReturnService.createReturnRequest(storeId, merchantId, input);
    return NextResponse.json({ returnRequest });
  } catch (error) {
    logger.error("[RETURNS_REQUESTS_POST] Failed to create return request", { storeId, error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
