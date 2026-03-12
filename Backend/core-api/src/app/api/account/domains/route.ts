import { urls } from "@vayva/shared";
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export const GET = withVayvaAPI(
  PERMISSIONS.DOMAINS_MANAGE,
  async (_req, { storeId }) => {
    try {
      // Fetch custom domains
      const domainMapping = await prisma.domainMapping.findFirst({
        where: { storeId },
      });
      // Fetch subdomain from store slug
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { slug: true },
      });
      const provider = getObject(domainMapping?.provider);
      return NextResponse.json(
        {
          id: domainMapping?.id || null,
          subdomain: store?.slug
            ? `${store.slug}.${urls.storefrontRoot()}`
            : null,
          customDomain: domainMapping?.domain || null,
          status: domainMapping?.status || "none",
          verificationToken: domainMapping?.verificationToken || null,
          lastCheckedAt: getString(provider.lastCheckedAt) || null,
          lastError: getString(provider.lastError) || null,
          sslEnabled: domainMapping?.status === "active",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[ACCOUNT_DOMAINS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch domain details" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.DOMAINS_MANAGE,
  async (req, { storeId }) => {
    try {
      const { checkFeatureAccess } = await import("@/lib/auth/gating");
      const access = await checkFeatureAccess(storeId, "custom_domain");
      if (!access.allowed) {
        return NextResponse.json(
          {
            error: access.reason,
          },
          { status: 403 },
        );
      }

      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const domain = getString(body.domain) || "";
      if (!domain)
        return NextResponse.json(
          { error: "Domain is required" },
          { status: 400 },
        );
      // Check if already mapped
      const existing = await prisma.domainMapping.findFirst({
        where: { domain },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Domain is already connected to another store." },
          { status: 409 },
        );
      }
      // Create mapping
      const mapping = await prisma.domainMapping.create({
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
    } catch (error: unknown) {
      logger.error("[ACCOUNT_DOMAINS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to add domain" },
        { status: 500 },
      );
    }
  },
);
