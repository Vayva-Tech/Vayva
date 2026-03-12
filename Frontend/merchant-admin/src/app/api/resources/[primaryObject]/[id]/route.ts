import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
const ALLOWED_TYPES = [
    "service",
    "campaign",
    "listing",
    "course",
    "post",
    "stay",
    "event",
    "digital_asset",
    "menu_item",
    "project",
    "vehicle",
    "lead",
];
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { params, storeId }: { params: Record<string, string> | Promise<Record<string, string>>; storeId: string }) => {
    try {
        const { primaryObject, id } = await params;
        if (!ALLOWED_TYPES.includes(primaryObject)) {
            return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
        }
        const resource = await prisma.product?.findFirst({
            where: { id, storeId, productType: primaryObject }
        });
        if (!resource) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadata: any = resource.metadata || {};
        const responseData = {
            ...metadata,
            id: resource.id,
            title: resource.title,
            name: resource.title,
            description: resource.description,
            price: Number(resource.price),
            status: (resource as any).status,
            handle: resource.handle
        };
        return NextResponse.json(responseData, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[RESOURCE_GET] Failed to fetch resource", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { params, storeId }: { params: Record<string, string> | Promise<Record<string, string>>; storeId: string }) => {
    try {
        const { primaryObject, id } = await params;
        const body = await req.json();
        if (!ALLOWED_TYPES.includes(primaryObject)) {
            return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
        }
        // Verify ownership and type first
        const existing = await prisma.product?.findFirst({
            where: { id, storeId, productType: primaryObject }
        });
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const { name, title, description, price, ...otherFields } = body;
        // Merge metadata
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentMetadata: any = existing.metadata || {};
        const newMetadata = { ...currentMetadata, ...otherFields };
        const updated = await prisma.product?.update({
            where: { id },
            data: {
                title: title || name || existing.title,
                description: description !== undefined ? description : existing.description,
                price: price !== undefined ? parseFloat(price) : existing.price,
                metadata: newMetadata
            }
        });
        return NextResponse.json({ success: true, id: updated.id });
    }
    catch (error) {
        logger.error("[RESOURCE_PATCH] Failed to update resource", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
