/**
 * POST /api/credits/use
 * Deduct credits for a specific feature usage
 */

import { NextRequest, NextResponse } from "next/server";
import { CreditManager } from "@/lib/credits/credit-manager";

export async function POST(req: NextRequest) {
  try {
    const storeId = req.headers.get("x-store-id");
    const { amount, feature, description } = await req.json();

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount required" },
        { status: 400 }
      );
    }

    if (!feature || typeof feature !== "string") {
      return NextResponse.json(
        { error: "Feature name required" },
        { status: 400 }
      );
    }

    const manager = new CreditManager();
    const result = await manager.useCredits(
      storeId,
      amount,
      feature,
      description || `Used ${amount} credits for ${feature}`
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Insufficient credits",
          remaining: result.remaining,
        },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      remaining: result.remaining,
    });
  } catch (error) {
    console.error("[CREDITS_USE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process credit usage" },
      { status: 500 }
    );
  }
}
