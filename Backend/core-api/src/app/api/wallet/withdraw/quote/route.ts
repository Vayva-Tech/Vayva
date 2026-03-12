import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { calculateWithdrawalFee } from "@/config/pricing";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
// Calculate fee based on configured percentage from pricing config
const calculateFee = (amount: number) => {
  return calculateWithdrawalFee(amount);
};
export const runtime = "nodejs";
export const POST = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (request) => {
  try {
    const body: unknown = await request.json().catch(() => ({}));
    const amount = isRecord(body)
      ? (getNumber(body.amount) ?? Number(body.amount))
      : Number.NaN;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const fee = calculateFee(amount);
    return NextResponse.json(
      {
        amount,
        fee,
        netAmount: amount - fee,
        currency: "NGN",
        estimatedArrival: "within 24 hours",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    logger.error("[WALLET_WITHDRAW_QUOTE_POST]", error);
    return NextResponse.json(
      { error: "Failed to generate quote" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
});
