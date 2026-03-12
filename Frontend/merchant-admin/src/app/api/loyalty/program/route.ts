import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoyaltyService } from "@/services/loyalty.service";
import { logger } from "@/lib/logger";

// GET /api/loyalty/program - Get or create loyalty program
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const program = await LoyaltyService.getOrCreateProgram(storeId);
    return NextResponse.json({ program });
  } catch (error) {
    logger.error("[LOYALTY_PROGRAM_GET] Failed to fetch loyalty program", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch loyalty program" }, { status: 500 });
  }
}

// POST /api/loyalty/program - Update loyalty program
export async function POST(req: Request) {
  let storeId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId: bodyStoreId, ...input } = body;
    storeId = bodyStoreId;

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const program = await LoyaltyService.updateProgram(storeId, input);
    return NextResponse.json({ program });
  } catch (error) {
    logger.error("[LOYALTY_PROGRAM_POST] Failed to update loyalty program", { storeId, error });
    return NextResponse.json({ error: "Failed to update loyalty program" }, { status: 500 });
  }
}
