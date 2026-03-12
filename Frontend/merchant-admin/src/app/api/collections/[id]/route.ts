import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id: collectionId } = await params;
        const collection = await prisma.collection?.findFirst({
            where: { id: collectionId, storeId },
            include: { _count: { select: { collectionProducts: true } } }
        });
        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: collection }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id: collectionId } = await params;
        const deleted = await prisma.collection?.deleteMany({
            where: { id: collectionId, storeId },
        });
        if (deleted.count === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error: unknown) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
});
export const PUT = withVayvaAPI(PERMISSIONS.PRODUCTS_EDIT, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id: collectionId } = await params;
        const body = await req.json();
        const updated = await prisma.collection?.updateMany({
            where: { id: collectionId, storeId },
            data: {
                title: body.title,
                description: body.description,
                handle: body.handle ? body.handle?.toLowerCase().replace(/\s+/g, "-") : undefined,
                updatedAt: new Date()
            }
        });
        if (updated.count === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const collection = await prisma.collection?.findFirst({
            where: { id: collectionId, storeId },
            include: { _count: { select: { collectionProducts: true } } }
        });

        return NextResponse.json({ success: true, data: collection });
    }
    catch (error: unknown) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
});
