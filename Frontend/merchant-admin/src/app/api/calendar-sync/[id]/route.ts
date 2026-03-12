import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;

        const products = await prisma.product?.findMany({
            where: { storeId },
            select: { id: true, metadata: true },
        });

        const target = products.find((p) => {
            const md = (p.metadata as Record<string, unknown>) || {};
            const list = Array.isArray(md.calendarSyncs) ? md.calendarSyncs : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return list.some((s: any) => s?.id === id);
        });

        if (!target) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const metadata = (target.metadata as Record<string, unknown>) || {};
        const existing = Array.isArray(metadata.calendarSyncs) ? metadata.calendarSyncs : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const next = existing.filter((s: any) => s?.id !== id);

        await prisma.product?.update({
            where: { id: target.id },
            data: {
                metadata: {
                    ...metadata,
                    calendarSyncs: next,
                },
            },
        });

        return NextResponse.json({ success: true }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        logger.error("[CALENDAR_SYNC_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete calendar sync" }, { status: 500 });
    }
});
