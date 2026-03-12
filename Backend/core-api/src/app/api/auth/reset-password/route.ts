import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { apiError, ApiErrorCode } from "@vayva/shared";
import crypto from "crypto";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const token = getString(body.token);
    const password = getString(body.password);
    if (!token || !password) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Missing required fields"),
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.VALIDATION_ERROR,
          "Password must be at least 8 characters",
        ),
        { status: 400 },
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    const reset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
    if (!reset || reset.usedAt || reset.expiresAt < now) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid or expired token"),
        { status: 400 },
      );
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      // Mark token used first (prevents races)
      await tx.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      });

      // Update password and bump sessionVersion (revokes existing sessions)
      await tx.user.update({
        where: { id: reset.userId },
        data: {
          password: hashedPassword,
          sessionVersion: { increment: 1 },
        },
      });

      // Best-effort: remove active sessions for this user
      await tx.merchantSession.deleteMany({
        where: { userId: reset.userId },
      });
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    logger.error("[RESET_PASSWORD]", error);
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal Error"),
      { status: 500 },
    );
  }
}
