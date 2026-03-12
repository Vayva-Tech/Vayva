import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import type { Prisma } from "@vayva/db";

const updateTicketSchema = z.object({
    status: z.enum(["OPEN", "RESOLVED", "PENDING", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    metadata: z.record(z.unknown()).optional(),
}).refine((val) => Object.keys(val).length > 0, { message: "No updates provided" });

export const PATCH = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        const parsed = updateTicketSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const { status, priority, metadata } = parsed.data;

        const updateData: Prisma.SupportTicketUpdateManyMutationInput = {};

        if (typeof status === "string") {
            const normalized = status.toLowerCase() as "open" | "in_progress" | "waiting" | "resolved" | "closed";
            const allowed = ["open", "in_progress", "waiting", "resolved", "closed"];
            if (!allowed.includes(normalized)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            }
            updateData.status = normalized;
        }

        if (typeof priority === "string") {
            const normalized = priority.toLowerCase() as "low" | "medium" | "high" | "urgent";
            const allowed = ["low", "medium", "high", "urgent"];
            if (!allowed.includes(normalized)) {
                return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
            }
            updateData.priority = normalized;
        }

        if (metadata !== undefined) {
            if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
                return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
            }
            updateData.metadata = metadata as Prisma.SupportTicketUpdateManyMutationInput["metadata"];
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No updates provided" }, { status: 400 });
        }

        const existing = await prisma.supportTicket?.findFirst({
            where: {
                id,
                storeId,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        if (metadata) {
            const current = (existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata))
                ? existing.metadata
                : {};
            updateData.metadata = {
                ...(current as Record<string, unknown>),
                ...(metadata as Record<string, unknown>),
            } as Prisma.SupportTicketUpdateManyMutationInput["metadata"];
        }

        const updated = await prisma.supportTicket?.updateMany({
            where: { id, storeId },
            data: {
                ...updateData,
                lastMessageAt: new Date(),
            },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        const fresh = await prisma.supportTicket?.findFirst({
            where: { id, storeId },
        });

        return NextResponse.json(fresh);
    }
    catch (_error: unknown) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
