import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";

export const PATCH = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Status required" }, { status: 400 });
        }

        // Verify booking belongs to store
        const booking = await prisma.booking?.findFirst({
            where: { id, storeId },
        });

        if (!booking) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        // Update status
        const updated = await prisma.booking?.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ success: true, booking: updated });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const { id } = await params;
        logger.error("[NIGHTLIFE_RESERVATIONS_ID_PATCH] Failed to update reservation", { storeId, id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
