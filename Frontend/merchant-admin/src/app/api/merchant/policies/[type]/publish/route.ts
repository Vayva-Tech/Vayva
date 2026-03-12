import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type PolicyType = "TERMS" | "PRIVACY" | "RETURNS" | "REFUNDS" | "SHIPPING_DELIVERY";

function normalizePolicyType(type: string): PolicyType {
  return type
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/^SHIPPING$/, "SHIPPING_DELIVERY") as PolicyType;
}

export const POST = withVayvaAPI(PERMISSIONS.STOREFRONT_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { type } = resolvedParams;
        
        const policy = await prisma.merchantPolicy?.update({
            where: {
                storeId_type: {
                    storeId,
                    type: normalizePolicyType(type) as any,
                },
            },
            data: {
                status: "PUBLISHED" as any,
                publishedAt: new Date(),
            } as any,
        });

        return NextResponse.json({ policy });
    } catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[POLICY_PUBLISH] Failed to publish policy", { storeId, type: resolvedParams.type, error });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
