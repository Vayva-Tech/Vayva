import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getAffiliateSession } from "../_session";
import { Paystack } from "@vayva/payments";

const requestPayoutSchema = z.object({
  amount: z.number().positive(),
});

export const GET = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { storeId, db } = ctx;
  const session = getAffiliateSession(req);
  if (!session || session.storeId !== storeId) {
    return NextResponse.json(
      { payouts: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const payouts = await db.affiliatePayout.findMany({
    where: { affiliateId: session.affiliateId, storeId },
    orderBy: { initiatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    {
      payouts: payouts.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount || 0),
        status: String(p.status || "pending").toLowerCase(),
        method: "bank_transfer",
        createdAt: p.initiatedAt?.toISOString?.() ?? null,
        processedAt: p.processedAt?.toISOString?.() ?? undefined,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});

export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { storeId, db } = ctx;
  const session = getAffiliateSession(req);
  if (!session || session.storeId !== storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const validated = requestPayoutSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validated.error.format() },
      { status: 400 },
    );
  }

  const amount = validated.data.amount;

  const affiliate = await db.affiliate.findFirst({
    where: { id: session.affiliateId, storeId },
  });

  if (!affiliate || affiliate.status !== "ACTIVE") {
    return NextResponse.json({ error: "Affiliate not active" }, { status: 403 });
  }

  const pending = Number(affiliate.pendingEarnings || 0);
  const minPayout = Number(affiliate.minimumPayout || 0);
  if (amount < minPayout) {
    return NextResponse.json(
      { error: "Amount below minimum payout", minPayout },
      { status: 400 },
    );
  }
  if (amount > pending) {
    return NextResponse.json(
      { error: "Insufficient available balance" },
      { status: 400 },
    );
  }
  if (!affiliate.paystackRecipientCode) {
    return NextResponse.json(
      { error: "Bank account not configured" },
      { status: 400 },
    );
  }

  // Build list of pending earnings to attach to payout (for audit/reconciliation).
  const earnings = await db.affiliateEarning.findMany({
    where: { affiliateId: affiliate.id, status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  const earningIds = earnings.map((e: any) => e.id);

  const payout = await db.affiliatePayout.create({
    data: {
      affiliateId: affiliate.id,
      storeId,
      amount,
      fee: 0,
      netAmount: amount,
      status: "PROCESSING",
      earningIds,
      requiresApproval: false,
    },
  });

  // Initiate Paystack transfer; webhook will mark PAID/FAILED.
  const transfer = await Paystack.initiateTransfer({
    amountKobo: Math.round(amount * 100),
    recipientCode: affiliate.paystackRecipientCode,
    reference: `AFF-PAYOUT-${payout.id}`,
    reason: `Affiliate payout - ${affiliate.referralCode}`,
  });

  const transferCode =
    typeof (transfer as any)?.transfer_code === "string"
      ? (transfer as any).transfer_code
      : typeof (transfer as any)?.transferCode === "string"
        ? (transfer as any).transferCode
        : null;

  await db.affiliatePayout.update({
    where: { id: payout.id },
    data: {
      paystackTransferCode: transferCode,
      status: "PROCESSING",
      bankName: affiliate.bankName,
      accountNumber: affiliate.accountNumber,
    },
  });

  return NextResponse.json({ success: true, payoutId: payout.id });
});

