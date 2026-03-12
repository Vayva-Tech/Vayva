import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
import { verifyDomainDns } from "@/lib/jobs/domain-verification";
import { logger } from "@/lib/logger";

interface DomainVerifyBody {
  domainMappingId?: string;
}

export const POST = withVayvaAPI(PERMISSIONS.DOMAINS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({})) as DomainVerifyBody;
        const domainMappingId = String(body?.domainMappingId || "");
        if (!domainMappingId) {
            return NextResponse.json({ error: "Domain mapping ID required" }, { status: 400 });
        }

        const pending = await prisma.domainMapping?.updateMany({
            where: { id: domainMappingId, storeId },
            data: { status: "pending" },
        });
        if (pending.count === 0) {
            return NextResponse.json({ error: "Domain not found" }, { status: 404 });
        }

        await verifyDomainDns(domainMappingId);

        const updated = await prisma.domainMapping?.findFirst({
            where: { id: domainMappingId, storeId },
            select: { id: true, status: true, provider: true },
        });

        return NextResponse.json({
            message: "Verification completed",
            status: updated?.status || "pending",
            provider: updated?.provider || null,
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[DOMAINS_VERIFY] Failed to verify domain", { storeId, message: err.message });
        return NextResponse.json({ error: "Failed to verify domain" }, { status: 500 });
    }
});
