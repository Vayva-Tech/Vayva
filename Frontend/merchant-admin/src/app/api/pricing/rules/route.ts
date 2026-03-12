import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PricingService } from "@/services/pricing.service";
import { logger } from "@/lib/logger";

// GET /api/pricing/rules - Get pricing rules
export async function GET(req: Request) {
  let storeId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    storeId = searchParams.get("storeId");
    const isActive = searchParams.get("isActive");
    const appliesTo = searchParams.get("appliesTo");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const { rules, total } = await PricingService.getRules(storeId, {
      isActive: isActive ? isActive === "true" : undefined,
      appliesTo: appliesTo as any,
      limit,
      offset,
    });

    return NextResponse.json({ rules, total });
  } catch (error) {
    logger.error("[PRICING_RULES_GET] Failed to fetch pricing rules", { storeId, error });
    return NextResponse.json(
      { error: "Failed to fetch pricing rules" },
      { status: 500 }
    );
  }
}

// POST /api/pricing/rules - Create pricing rule
export async function POST(req: Request) {
  let storeId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    storeId = body.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "storeId required" }, { status: 400 });
    }

    const { ...input } = body;
    const rule = await PricingService.createRule(storeId, input);
    return NextResponse.json({ rule });
  } catch (error) {
    logger.error("[PRICING_RULES_POST] Failed to create pricing rule", { storeId, error });
    return NextResponse.json(
      { error: "Failed to create pricing rule" },
      { status: 500 }
    );
  }
}
