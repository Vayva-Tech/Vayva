import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { sanitizeMarkdown, validatePolicyContent } from "@vayva/policies";
import { logger } from "@/lib/logger";

type PolicyType = "TERMS" | "PRIVACY" | "RETURNS" | "REFUNDS" | "SHIPPING_DELIVERY";

export const dynamic = "force-dynamic";

function normalizePolicyType(type: string): PolicyType {
  return type
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/^SHIPPING$/, "SHIPPING_DELIVERY") as PolicyType;
}

export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { type } = resolvedParams;
        const policy = await prisma.merchantPolicy?.findUnique({
            where: {
                storeId_type: {
                    storeId,
                    type: normalizePolicyType(type) as any,
                },
            },
        });
        if (!policy) {
            return NextResponse.json({ error: "Policy not found" }, { status: 404 });
        }
        return NextResponse.json({ policy }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[POLICIES_TYPE_GET] Failed to fetch policy", { storeId, type: resolvedParams.type, error });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.STOREFRONT_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { type } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        const { title, contentMd } = body;
        
        // Validate content
        const validation = validatePolicyContent(contentMd);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        
        // Sanitize and generate HTML
        const contentHtml = sanitizeMarkdown(contentMd);
        const policy = await prisma.merchantPolicy?.update({
            where: {
                storeId_type: {
                    storeId,
                    type: normalizePolicyType(type) as any,
                },
            },
            data: {
                title,
                contentMd,
                contentHtml,
                updatedAt: new Date(),
            },
        });
        return NextResponse.json({ policy });
    }
    catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[POLICY_PUBLISH] Failed to publish policy", { storeId, type: resolvedParams.type, error });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

export const PUT = POST;
