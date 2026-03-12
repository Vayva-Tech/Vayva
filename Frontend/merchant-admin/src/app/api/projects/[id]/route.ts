import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

/**
 * GET /api/projects/[id]
 */
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const { id } = params as { id: string };

    const project = await prisma.product.findFirst({
        where: {
            id,
            storeId,
            productType: "PROJECT",
        },
        include: {
            productImages: { orderBy: { position: "asc" } },
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project }, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
});

/**
 * PATCH /api/projects/[id]
 */
export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_EDIT, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const { id } = params as { id: string };

    const body = await req.json();
    const { title, description, status, client, year, category, tags } = body;

    const existing = await prisma.product.findFirst({
        where: {
            id,
            storeId,
            productType: "PROJECT",
        },
    });

    if (!existing) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const existingMeta = (existing.metadata as Record<string, unknown>) || {};

    const project = await prisma.product.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            ...(tags !== undefined && { tags }),
            metadata: {
                ...existingMeta,
                ...(client !== undefined && { client }),
                ...(year !== undefined && { year }),
                ...(category !== undefined && { category }),
            },
        },
        include: {
            productImages: true,
        },
    });

    return NextResponse.json({ project });
});

/**
 * DELETE /api/projects/[id]
 */
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const { id } = params as { id: string };

    const existing = await prisma.product.findFirst({
        where: {
            id,
            storeId,
            productType: "PROJECT",
        },
    });

    if (!existing) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.product.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
});
