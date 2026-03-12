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
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const pin = getString(body.pin);
      if (!pin) {
        return NextResponse.json({ error: "PIN is required" }, { status: 400 });
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { walletPin: true },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      if (!store.walletPin) {
        return NextResponse.json({ success: true, status: "no_pin_set" });
      }

      const isValid = await bcrypt.compare(pin, store.walletPin);
      if (isValid) {
        return NextResponse.json({ success: true, status: "valid" });
      } else {
        return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
      }
    } catch (error) {
      logger.error("[WALLET_PIN_VERIFY_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
