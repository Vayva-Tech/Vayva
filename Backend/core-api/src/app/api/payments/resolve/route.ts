import { NextRequest, NextResponse } from "next/server";
import { PaystackService } from "@/lib/payment/paystack";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  const { searchParams } = new URL(req.url);
  const accountNumber = searchParams.get("account_number");
  const bankCode = searchParams.get("bank_code");
  if (!accountNumber || !bankCode) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey) {
    logger.error(
      "[BANK_RESOLVE] PAYSTACK_SECRET_KEY not configured",
      new Error("Missing PAYSTACK_SECRET_KEY"),
    );
    return NextResponse.json(
      { error: "Payment service not configured. Please contact support." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const data = await PaystackService.resolveAccount(accountNumber, bankCode);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Could not resolve account";
    logger.error("[BANK_RESOLVE]", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }
}
