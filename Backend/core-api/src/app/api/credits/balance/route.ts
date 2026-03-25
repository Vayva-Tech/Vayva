/**
 * GET /api/credits/balance
 * Returns current credit balance and usage for the authenticated store
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma as _prisma } from "@vayva/db";
import { CreditManager } from "@/lib/credits/credit-manager";

export async function GET(req: NextRequest) {
  try {
    // Get store ID from header (set by auth middleware)
    const storeId = req.headers.get("x-store-id");
    
    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const manager = new CreditManager();
    const balance = await manager.getBalance(storeId);

    if (!balance) {
      // No allocation found - return zeros
      return NextResponse.json({
        monthlyCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        resetDate: null,
        plan: "FREE",
      });
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error("[CREDITS_BALANCE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch credit balance" },
      { status: 500 }
    );
  }
}
