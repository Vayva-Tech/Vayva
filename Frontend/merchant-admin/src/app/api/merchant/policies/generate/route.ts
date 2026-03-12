import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error -- audit-handler module types may not be fully resolved in all TS configs
import { logAudit, AuditEventType } from "@/lib/audit-handler";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { generatePolicyFromTemplate } from "@vayva/policies";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

interface StoreSettings {
  businessName?: string;
  supportEmail?: string;
  [key: string]: unknown;
}

export const POST = withVayvaAPI(PERMISSIONS.STOREFRONT_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { type } = resolvedParams;
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { name: true, settings: true },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const settings = (store.settings as StoreSettings | null) ?? {};
        
        const generated = generatePolicyFromTemplate({
            storeName: store.name,
            storeSlug: store.name.toLowerCase().replace(/\s+/g, '-'),
            supportEmail: settings.supportEmail,
        });

        return NextResponse.json({ generated });
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[POLICY_GENERATE] Failed to generate policy", { storeId, type: resolvedParams.type, error });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
