import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReturnService } from "@/services/return.service";
import { logger } from "@/lib/logger";

// GET /api/returns/policy - Get or create return policy
export async function GET(req: Request) {
  let storeId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const policy = await ReturnService.getOrCreatePolicy(storeId);
    return NextResponse.json({ policy });
  } catch (error: unknown) {
    logger.error("[RETURNS_POLICY_GET] Failed to fetch return policy", { storeId, error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/returns/policy - Update return policy
export async function POST(req: Request) {
  let storeId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    storeId = body.storeId;
    const { ...input } = body;

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const policy = await ReturnService.updatePolicy(storeId, input);
    return NextResponse.json({ policy });
  } catch (error: unknown) {
    logger.error("[RETURNS_POLICY_POST] Failed to update return policy", { storeId, error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
