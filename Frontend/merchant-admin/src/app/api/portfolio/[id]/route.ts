import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PORTFOLIO_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const project = await prisma.portfolioProject?.findUnique({
            where: { id, storeId },
            include: { comments: true }
        });
        if (!project)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ project }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PORTFOLIO_ID_GET] Failed to fetch portfolio", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.PORTFOLIO_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        // Destructure allowed fields
        const { title, description, images, clientMode, password } = body;
        
        // Verify existence and ownership first for update
        const existing = await prisma.portfolioProject?.findUnique({
            where: { id, storeId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const project = await prisma.portfolioProject?.update({
            where: { id },
            data: {
                title: title !== undefined ? title : undefined,
                description: description !== undefined ? description : undefined,
                images: images !== undefined ? images : undefined,
                clientMode: clientMode !== undefined ? clientMode : undefined,
                password: password !== undefined ? password : undefined,
            }
        });
        return NextResponse.json({ project });
    }
    catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PORTFOLIO_ID_PATCH] Failed to update portfolio", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
