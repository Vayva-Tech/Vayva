import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import bcrypt from "bcryptjs";

export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId }) => {
    try {
      const body = await req.json();
      const { pin } = body;

      if (!pin || pin.length !== 4 || isNaN(Number(pin))) {
        return NextResponse.json(
          { error: "PIN must be 4 digits" },
          { status: 400 },
        );
      }

      const hash = await bcrypt.hash(pin, 10);

      await db.wallet.upsert({
        where: { storeId },
        create: {
          storeId,
          pinHash: hash,
          pinSet: true,
        },
        update: {
          pinHash: hash,
          pinSet: true,
          failedPinAttempts: 0, // Reset attempts on reset
          isLocked: false, // Unlock if locked
        },
      });

      return NextResponse.json({
        success: true,
        message: "PIN set successfully",
      });
    } catch {
      return NextResponse.json({ error: "Failed to set PIN" }, { status: 500 });
    }
  },
);
