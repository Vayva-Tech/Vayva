import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { withStorefrontAPI } from "@/lib/api-handler";
import { reportError } from "@/lib/error";

const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  website: z.string().optional(),
  socialMedia: z.string().optional(),
  marketingMethod: z.string().optional(),
  agreedToTerms: z.boolean().optional(),
});

function base64url(input: Buffer | string): string {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signAffiliateSession(payload: Record<string, unknown>): string {
  const secret =
    process.env.AFFILIATE_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "dev";
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/**
 * POST /api/affiliate/register
 * Register an affiliate for the current storefront (storeId derived from host).
 * Sets a signed cookie to allow access to the affiliate dashboard on this storefront.
 */
export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { requestId, storeId, db } = ctx;
  try {
    const body = await req.json().catch(() => ({}));
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 },
      );
    }

    const { email, fullName, phone } = validated.data;

    const emailLower = email.toLowerCase();

    // Basic anti-spam: limit OTP sends per email (per store) by time window.
    const lastOtp = await db.otpCode.findFirst({
      where: {
        identifier: emailLower,
        type: "AFFILIATE_VERIFICATION",
      },
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
        identifier: emailLower,
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

    const existing = await db.affiliate.findFirst({
      where: { storeId, email: emailLower },
      select: { id: true },
    });

    const affiliate =
      existing
        ? await db.affiliate.findUnique({ where: { id: existing.id } })
        : await db.affiliate.create({
            data: {
              storeId,
              email: emailLower,
              name: fullName,
              phone: phone || null,
              status: "PENDING",
              kycStatus: "PENDING",
              referralCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
              marketingConsent: true,
              preferredPayoutMethod: "bank_transfer",
            },
          });

    // Create OTP for email verification (Option B)
    await db.otpCode.create({
      data: {
        identifier: emailLower,
        code: otpCode,
        type: "AFFILIATE_VERIFICATION",
        expiresAt: otpExpiresAt,
      },
    });

    // Queue email via outbox (storefront worker/emailer should deliver this)
    await db.notificationOutbox.create({
      data: {
        storeId,
        type: "AFFILIATE_VERIFICATION",
        channel: "EMAIL",
        to: emailLower,
        payload: {
          otpCode,
          expiresInMinutes: 10,
          affiliateName: fullName,
        },
        nextRetryAt: new Date(),
      },
    });

    const token = signAffiliateSession({
      affiliateId: affiliate.id,
      storeId,
      iat: Date.now(),
    });

    const res = NextResponse.json({
      success: true,
      affiliateId: affiliate.id,
      status: affiliate.status,
      requiresVerification: true,
    });
    res.cookies.set("vayva_affiliate", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (error) {
    reportError(error, {
      route: "POST /api/affiliate/register",
      storeId,
      requestId,
    });
    return NextResponse.json(
      { error: "Failed to register affiliate" },
      { status: 500 },
    );
  }
});

