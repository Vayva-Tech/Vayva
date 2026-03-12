import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface LeadBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status?: string;
  tags?: string[];
}

export const GET = withVayvaAPI(PERMISSIONS.CUSTOMERS_VIEW, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = params as { id: string };
        const lead = await prisma.customer?.findFirst({ where: { id, storeId } });
        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }
        return NextResponse.json({ lead }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[LEADS_GET] Failed to fetch lead", { message: err.message, storeId });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.CUSTOMERS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = params as { id: string };
        const body = await req.json().catch(() => ({})) as LeadBody;
        const { firstName, lastName, email, phone, notes, status, tags } = body;

        const existing = await prisma.customer?.findFirst({ where: { id, storeId }, select: { tags: true } });
        if (!existing) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        let updatedTags: string[] = (existing.tags as string[]) ?? [];
        if (status) {
            updatedTags = updatedTags.filter((t: string) => !t.startsWith("status:"));
            updatedTags.push(`status:${status}`);
        }
        if (tags) {
            updatedTags = [...new Set([...updatedTags, ...tags])];
        }

        const updated = await prisma.customer?.updateMany({
            where: { id, storeId },
            data: {
                ...(firstName !== undefined && { firstName }),
                ...(lastName !== undefined && { lastName }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(notes !== undefined && { notes }),
                tags: updatedTags,
            },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const lead = await prisma.customer?.findFirst({ where: { id, storeId } });
        return NextResponse.json({ lead });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[LEADS_PATCH] Failed to update lead", { message: err.message, storeId });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const DELETE = withVayvaAPI(PERMISSIONS.CUSTOMERS_MANAGE, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = params as { id: string };
        const deleted = await prisma.customer?.deleteMany({ where: { id, storeId } });
        if (deleted.count === 0) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[LEADS_DELETE] Failed to delete lead", { message: err.message, storeId });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
