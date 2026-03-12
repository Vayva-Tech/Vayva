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
      // Basic validation
      if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN must be 4 digits" },
          { status: 400 },
        );
      }
      // Hash PIN
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(pin, salt);
      // Store & Invalidate old sessions by incrementing version
      await prisma.wallet.update({
        where: { storeId },
        data: {
          pinHash,
          pinSet: true,
          pinVersion: { increment: 1 },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error("[AUTH_PIN_SETUP_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to setup PIN" },
        { status: 500 },
      );
    }
  },
);
