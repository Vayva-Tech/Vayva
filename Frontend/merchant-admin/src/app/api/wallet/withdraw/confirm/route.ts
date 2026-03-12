import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WalletService } from "@/services/wallet";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export const POST = withVayvaAPI(PERMISSIONS.PAYOUTS_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
  const correlationId = crypto.randomUUID();
  try {
    // Apply rate limiting for confirmation: 10 requests per 5 minutes per user
    await checkRateLimitCustom(user.id, "wallet_withdraw_confirm", 10, 300);
    
    const body = await req.json().catch(() => ({}));
    const withdrawalId = String(body.withdrawalId || "");
    const otpCode = String(body.otpCode || "");

    if (!withdrawalId) {
      return NextResponse.json({ error: "withdrawalId required", correlationId }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (!otpCode) {
      return NextResponse.json({ error: "otpCode required", correlationId }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const result = await WalletService.confirmWithdrawal(withdrawalId, otpCode);

    return NextResponse.json({ 
      success: result.success, 
      message: result.message,
      correlationId 
    }, { headers: { "Cache-Control": "no-store" } });
    
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: "Too many confirmation attempts. Please try again later.", correlationId }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "300" } });
    }
    const errorMessage = err instanceof Error ? err.message : "Confirmation failed";
    logger.error("[WALLET_WITHDRAW_CONFIRM_ERROR]", { error: errorMessage, storeId, userId: user.id, correlationId });
    return NextResponse.json({ error: errorMessage, correlationId }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
});
