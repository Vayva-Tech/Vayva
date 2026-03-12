import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { pin } = body;
        if (!pin) {
            return NextResponse.json({ error: "PIN is required" }, { status: 400 });
        }

        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { walletPin: true }
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
        }
        else {
            return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
        }
    }
    catch (error) {
        logger.error("[WALLET_PIN_VERIFY] Failed to verify PIN", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
