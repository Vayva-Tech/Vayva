import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const pin = getString(body.pin);
      if (!pin || pin.length !== 4) {
        return NextResponse.json(
          { error: "Invalid PIN format" },
          { status: 400 },
        );
      }
      const wallet = await prisma.wallet.findUnique({
        where: { storeId },
      });
      if (!wallet || !wallet.pinHash) {
        return NextResponse.json({ error: "PIN not set up" }, { status: 400 });
      }
      // 1. Check Lockout
      if (
        wallet.isLocked &&
        wallet.lockedUntil &&
        wallet.lockedUntil > new Date()
      ) {
        const retryAfter = Math.ceil(
          (wallet.lockedUntil.getTime() - Date.now()) / 1000,
        );
        return NextResponse.json(
          {
            error: "Too many attempts. Account locked.",
            requiredAction: "WAIT",
            details: { retryAfterSeconds: retryAfter },
          },
          { status: 403 },
        );
      }
      const isValid = await bcrypt.compare(pin, wallet.pinHash);
      if (!isValid) {
        // 2. Increment fail count and handle lockout
        const newAttempts = wallet.failedPinAttempts + 1;
        const isNowLocked = newAttempts >= 5;
        const lockedUntil = isNowLocked
          ? new Date(Date.now() + 15 * 60 * 1000)
          : null;
        await prisma.wallet.update({
          where: { storeId },
          data: {
            failedPinAttempts: newAttempts,
            isLocked: isNowLocked,
            lockedUntil: lockedUntil,
          },
        });
        return NextResponse.json(
          {
            error: isNowLocked
              ? "Too many attempts. Locked for 15m."
              : "Incorrect PIN",
            attemptsRemaining: Math.max(0, 5 - newAttempts),
          },
          { status: 403 },
        );
      }
      // 3. Reset failures on success
      await prisma.wallet.update({
        where: { storeId },
        data: {
          failedPinAttempts: 0,
          isLocked: false,
          lockedUntil: null,
        },
      });
      // 4. Establish secure PIN session
      const { createPinSession } = await import("@/lib/auth/gating");
      await createPinSession(storeId);
      return NextResponse.json({ success: true });
    } catch (e) {
      logger.error("[AUTH_PIN_VERIFY_POST]", e, { storeId, userId: user.id });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  },
);
