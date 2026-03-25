import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getAffiliateSession } from "../_session";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
});

/**
 * POST /api/affiliate/verify
 * Verifies the affiliate email OTP and auto-activates the affiliate (Option B).
 */
export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { storeId, db } = ctx;
  const session = getAffiliateSession(req);
  if (!session || session.storeId !== storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const validated = verifySchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validated.error.format() },
      { status: 400 },
    );
  }

  const email = validated.data.email.toLowerCase();
  const code = validated.data.code;

  const otp = await db.otpCode.findFirst({
    where: {
      identifier: email,
      type: "AFFILIATE_VERIFICATION",
      code,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const affiliate = await db.affiliate.findFirst({
    where: { id: session.affiliateId, storeId, email },
  });

  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  }

  await db.$transaction(async (tx: any) => {
    await tx.otpCode.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    await tx.affiliate.update({
      where: { id: affiliate.id },
      data: {
        status: "ACTIVE",
        // keep kycStatus as-is; activation here is "email verified"
      },
    });
  });

  return NextResponse.json({ success: true });
});

