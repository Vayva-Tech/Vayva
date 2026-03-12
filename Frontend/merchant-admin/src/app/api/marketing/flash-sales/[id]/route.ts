import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const PATCH = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: NextRequest, { storeId, params }: APIContext) => {
    try {
        const { id } = await params;
        const body = await req.json();
        // Validate ownership
        const existing = await prisma.flashSale.findFirst({
            where: { id, storeId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
        }
        const updated = await prisma.flashSale.updateMany({
            where: { id, storeId },
            data: {
                name: body.name !== undefined ? body.name : undefined,
                discount: body.discount !== undefined ? Number(body.discount) : undefined,
                startTime: body.startTime ? new Date(body.startTime) : undefined,
                endTime: body.endTime ? new Date(body.endTime) : undefined,
                isActive: body.isActive !== undefined ? body.isActive : undefined,
                targetType: body.targetType !== undefined ? body.targetType : undefined,
                targetId: body.targetId !== undefined ? body.targetId : undefined,
            },
        });
        if (updated.count === 0) {
            return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
        }

        const refreshed = await prisma.flashSale.findFirst({ where: { id, storeId } });
        return NextResponse.json({ success: true, data: refreshed });
    }
    catch (error) {
        const { id } = await params;
        logger.error("[FLASH_SALE_PATCH] Failed to update flash sale", { storeId, id, error });
        return NextResponse.json({ error: "Failed to update flash sale" }, { status: 500 });
    }
});
export const DELETE = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: NextRequest, { storeId, params }: APIContext) => {
    try {
        const { id } = await params;
        // Validate ownership
        const deleted = await prisma.flashSale.deleteMany({
            where: { id, storeId },
        });
        if (deleted.count === 0) {
            return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        const { id } = await params;
        logger.error("[FLASH_SALE_DELETE] Failed to delete flash sale", { storeId, id, error });
        return NextResponse.json({ error: "Failed to delete flash sale" }, { status: 500 });
    }
});
