import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, ApiErrorCode, urls } from "@vayva/shared";
import crypto from "crypto";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function bumpRateLimit(
  key: string,
  limit: number,
  durationSeconds: number,
) {
  const now = new Date();
  await prisma.rateLimit.deleteMany({
    where: {
      key,
      expireAt: { lt: now },
    },
  });

  const record = await prisma.rateLimit.upsert({
    where: { key },
    create: {
      key,
      points: 1,
      expireAt: new Date(now.getTime() + durationSeconds * 1000),
    },
    update: {
      points: { increment: 1 },
    },
    select: { points: true },
  });

  return record.points <= limit;
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const email = getString(body.email);
    if (!email) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Email is required"),
        { status: 400 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const emailLower = email.toLowerCase();

    // Rate limit (fail closed but do not reveal): 5/hour per IP and 5/hour per email
    // Always return 200 to prevent enumeration.
    const okIp = await bumpRateLimit(`rl:pwd_reset_ip:${ip}`, 5, 60 * 60);
    const okEmail = await bumpRateLimit(
      `rl:pwd_reset_email:${emailLower}`,
      5,
      60 * 60,
    );
    if (!okIp || !okEmail) {
      return NextResponse.json({ success: true, data: { success: true } });
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    // 2. Security: Always return OK even if user doesn't exist to prevent enumeration
    if (!user) {
      return NextResponse.json({ success: true, data: { success: true } });
    }

    const { id: _ignore } = await prisma.$transaction(async (tx) => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const resetUrl = urls.merchantResetPasswordUrl(rawToken);

      // Use unique dedupeKey to ensure one-email-per-request
      await tx.emailOutbox.create({
        data: {
          type: "PASSWORD_RESET",
          toEmail: user.email,
          subject: "Reset your Vayva password",
          dedupeKey: `pwreset_${user.id}_${tokenHash}`,
          payload: { resetUrl, minutes: 30 },
          status: "PENDING",
        },
      });

      return { id: user.id };
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    logger.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal Error"),
      { status: 500 },
    );
  }
}
