import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId } = ctx;
  const t = await getTenantFromHost();
  if (!t.ok) {
    return NextResponse.json(
      { error: "Store not found", requestId },
      { status: 404 },
    );
  }

  try {
    const store = await prisma.store.findFirst({
      where: { slug: t.slug },
      select: { settings: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const settings = getRecord(store.settings) ?? {};
    const policiesValue = settings.policies;
    const policies = (getRecord(policiesValue) as {
      refundPolicy?: string;
      shippingPolicy?: string;
      termsOfService?: string;
      privacyPolicy?: string;
    } | null) || {
      refundPolicy: "",
      shippingPolicy: "",
      termsOfService: "",
      privacyPolicy: "",
    };

    return NextResponse.json(
      {
        ...policies,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: standardHeaders(requestId),
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;
    logger.error("[PUBLIC_POLICIES_GET]", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Failed to fetch policies", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
