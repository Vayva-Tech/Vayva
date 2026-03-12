import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ORDERS_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    try {

        const quote = await prisma.booking.findFirst({
            where: {
                id,
                storeId,
                metadata: {
                    path: ["type"],
                    equals: "quote_request",
                },
            },
        });

        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        const meta = quote.metadata as Record<string, unknown>;
        return NextResponse.json({
            quote: {
                id: quote.id,
                quoteNumber: meta?.quoteNumber,
                companyName: meta?.companyName,
                contactName: meta?.contactName,
                contactEmail: meta?.contactEmail,
                contactPhone: meta?.contactPhone,
                items: meta?.items || [],
                total: meta?.total || 0,
                status: quote.status,
                notes: quote.notes,
                validUntil: quote.endsAt,
                createdAt: quote.createdAt,
            },
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[QUOTE_GET_BY_ID] Failed to fetch quote", { storeId, id, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    try {
        const body = await req.json().catch(() => ({}));
        const { status, notes } = body;

        const existing = await prisma.booking.findFirst({
            where: {
                id,
                storeId,
                metadata: {
                    path: ["type"],
                    equals: "quote_request",
                },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        const quote = await prisma.booking.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });

        return NextResponse.json({ quote });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[QUOTE_PATCH] Failed to update quote", { storeId, id, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const DELETE = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    try {

        const existing = await prisma.booking.findFirst({
            where: {
                id,
                storeId,
                metadata: {
                    path: ["type"],
                    equals: "quote_request",
                },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        await prisma.booking.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[QUOTE_DELETE] Failed to delete quote", { storeId, id, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
