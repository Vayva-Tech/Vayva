import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params: rawParams }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const params = await Promise.resolve(rawParams);
        const { id: orderId } = params;
        const body = await req.json().catch(() => ({})) as { note?: string };
        const { note } = body;

        if (!note || typeof note !== "string") {
            return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
        }

        const order = await prisma.order?.findFirst({
            where: { id: orderId, storeId },
            select: { id: true, internalNote: true },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Append note to internalNote (newline separated)
        const existingNote = order.internalNote || "";
        const timestamp = new Date().toISOString();
        const newNoteEntry = `[${timestamp}] ${note}`;
        const updatedNote = existingNote ? `${existingNote}\n${newNoteEntry}` : newNoteEntry;

        await prisma.order?.update({
            where: { id: orderId },
            data: { internalNote: updatedNote },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[ORDER_NOTES_POST] Failed to add order note", { storeId, message: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
