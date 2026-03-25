import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getAffiliateSession } from "../_session";

const resendSchema = z.object({
  email: z.string().email(),
});

export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { storeId, db } = ctx;
  const session = getAffiliateSession(req);
  if (!session || session.storeId !== storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const validated = resendSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validated.error.format() },
      { status: 400 },
    );
  }

  const email = validated.data.email.toLowerCase();

  // Ensure session belongs to this affiliate+email
  const affiliate = await db.affiliate.findFirst({
    where: { id: session.affiliateId, storeId, email },
    select: { id: true, status: true, name: true },
  });
  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  }
  if (affiliate.status === "ACTIVE") {
    return NextResponse.json({ success: true, message: "Already verified" });
  }

  // Rate limit: 1/min, 5/hour
  const lastOtp = await db.otpCode.findFirst({
    where: { identifier: email, type: "AFFILIATE_VERIFICATION" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const lastSentMs = lastOtp ? Date.now() - new Date(lastOtp.createdAt).getTime() : Infinity;
  if (lastSentMs < 60_000) {
    return NextResponse.json(
      { error: "Please wait before requesting another code" },
      { status: 429 },
    );
  }
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const sendsLastHour = await db.otpCode.count({
    where: {
      identifier: email,
      type: "AFFILIATE_VERIFICATION",
      createdAt: { gte: oneHourAgo },
    },
  });
  if (sendsLastHour >= 5) {
    return NextResponse.json(
      { error: "Too many verification attempts. Try again later." },
      { status: 429 },
    );
  }

  const otpCode = crypto.randomInt(100000, 999999).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.otpCode.create({
    data: {
      identifier: email,
      code: otpCode,
      type: "AFFILIATE_VERIFICATION",
      expiresAt: otpExpiresAt,
    },
  });

  await db.notificationOutbox.create({
    data: {
      storeId,
      type: "AFFILIATE_VERIFICATION",
      channel: "EMAIL",
      to: email,
      payload: {
        otpCode,
        expiresInMinutes: 10,
        affiliateName: affiliate.name,
      },
      nextRetryAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
});

