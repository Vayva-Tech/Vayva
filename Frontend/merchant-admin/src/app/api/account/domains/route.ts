import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.DOMAINS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        // Fetch custom domains
        const domainMapping = await prisma.domainMapping?.findFirst({
            where: { storeId },
        });
        // Fetch subdomain from store slug
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { slug: true },
        });
        return NextResponse.json({
            id: domainMapping?.id || null,
            subdomain: store?.slug ? `${store.slug}.${urls.storefrontRoot()}` : null,
            customDomain: domainMapping?.domain || null,
            status: domainMapping?.status || "none",
            verificationToken: domainMapping?.verificationToken || null,
            lastCheckedAt: (domainMapping?.provider as Record<string, unknown>)?.lastCheckedAt || null,
            lastError: (domainMapping?.provider as Record<string, unknown>)?.lastError || null,
            sslEnabled: domainMapping?.status === "active",
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[DOMAINS_GET] Failed to fetch domain details", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch domain details" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.DOMAINS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { checkFeatureAccess } = await import("@/lib/auth/gating");
        const access = await checkFeatureAccess(storeId, "custom_domain");
        if (!access.allowed) {
            return NextResponse.json({
                error: access.reason,
            }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const { domain } = body;
        if (!domain)
            return NextResponse.json({ error: "Domain is required" }, { status: 400 });
        // Check if already mapped
        const existing = await prisma.domainMapping?.findFirst({
            where: { domain },
        });
        if (existing) {
            return NextResponse.json({ error: "Domain is already connected to another store." }, { status: 409 });
        }
        // Create mapping
        const mapping = await prisma.domainMapping?.create({
            data: {
                storeId,
                domain,
                status: "pending",
                verificationToken: `vey_${Math.random().toString(36).substring(2, 15)}`, // Test token generation
                provider: {
                    provider: "manual", // or vercel
                    lastCheckedAt: null,
                },
            },
        });
        return NextResponse.json(mapping);
    }
    catch (error) {
        logger.error("[DOMAINS_POST] Failed to add domain", { storeId, error });
        return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
    }
});
