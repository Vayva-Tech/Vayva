import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { TEMPLATE_REGISTRY } from "@/lib/templates/index";
import { logger } from "@/lib/logger";

const PLAN_HIERARCHY = {
  free: 0,
  growth: 1,
  pro: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizePlan(plan: unknown): keyof typeof PLAN_HIERARCHY {
  const p = String(plan ?? "free").toLowerCase();
  if (p === "pro" || p === "business" || p === "enterprise") return "pro";
  if (p === "growth") return "growth";
  return "free";
}

function canUseTemplate(storePlan: unknown, requiredPlan: unknown): boolean {
  const storeTier = PLAN_HIERARCHY[normalizePlan(storePlan)] ?? 0;
  const requiredTier = PLAN_HIERARCHY[normalizePlan(requiredPlan)] ?? 0;
  return storeTier >= requiredTier;
}

function withDraftExtras(
  draft: Prisma.StorefrontDraftGetPayload<{ include: { template: true } }>,
  storeSlug: string | null,
) {
  const templateRecord = draft.template as unknown;
  const template = draft.template
    ? {
        ...draft.template,
        displayName:
          (isRecord(templateRecord)
            ? getString(templateRecord.displayName)
            : undefined) ||
          draft.template.name ||
          draft.template.id,
      }
    : null;

  return {
    ...draft,
    store: { slug: storeSlug },
    template,
  };
}

function getRequiredPlan(templateId: string): unknown {
  const registry: Record<string, unknown> = isRecord(TEMPLATE_REGISTRY)
    ? (TEMPLATE_REGISTRY as Record<string, unknown>)
    : {};
  const entry = registry[templateId];
  if (!isRecord(entry)) return undefined;
  return entry.requiredPlan;
}

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (req, { storeId }) => {
    try {
      const [draft, store] = await Promise.all([
        prisma.storefrontDraft.findUnique({
          where: { storeId },
          include: { template: true },
        }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: { slug: true },
        }),
      ]);
      if (!draft) {
        return NextResponse.json({ found: false }, { status: 404 });
      }
      return NextResponse.json(
        { found: true, draft: withDraftExtras(draft, store?.slug ?? null) },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[STOREFRONT_DRAFT_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const activeTemplateId = getString(body.activeTemplateId);
      const themeConfig = body.themeConfig;
      const sectionConfig = body.sectionConfig;
      const sectionOrder = Array.isArray(body.sectionOrder)
        ? (body.sectionOrder as string[])
        : undefined;
      const assets = body.assets;

      if (activeTemplateId) {
        const exists = await prisma.templateManifest.findUnique({
          where: { id: activeTemplateId },
          select: { id: true },
        });
        if (!exists) {
          return NextResponse.json(
            { error: "Invalid activeTemplateId" },
            { status: 400 },
          );
        }

        const requiredPlan = getRequiredPlan(activeTemplateId) ?? "free";
        const store = await prisma.store.findUnique({
          where: { id: storeId },
          select: { plan: true },
        });
        if (!canUseTemplate(store?.plan, requiredPlan)) {
          const requiredDisplay =
            String(requiredPlan).charAt(0).toUpperCase() +
            String(requiredPlan).slice(1);
          return NextResponse.json(
            {
              error: "TEMPLATE_LOCKED",
              requiredPlan,
              currentPlan: normalizePlan(store?.plan),
              message: `Upgrade to ${requiredDisplay} to unlock this template`,
            },
            { status: 403 },
          );
        }
      }

      const [draftResult, store] = await Promise.all([
        prisma.storefrontDraft.upsert({
          where: { storeId },
          create: {
            storeId,
            activeTemplateId: activeTemplateId || "",
            themeConfig: (themeConfig || {}) as Prisma.InputJsonValue,
            sectionConfig: (sectionConfig || {}) as Prisma.InputJsonValue,
            sectionOrder: (sectionOrder || []) as string[],
            assets: (assets || {}) as Prisma.InputJsonValue,
          },
          update: {
            activeTemplateId: activeTemplateId as string | undefined,
            themeConfig: (themeConfig ?? undefined) as
              | Prisma.InputJsonValue
              | undefined,
            sectionConfig: (sectionConfig ?? undefined) as
              | Prisma.InputJsonValue
              | undefined,
            sectionOrder: sectionOrder || undefined,
            assets: (assets ?? undefined) as Prisma.InputJsonValue | undefined,
          },
          include: { template: true },
        }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: { slug: true },
        }),
      ]);

      if (!draftResult) {
        return NextResponse.json(
          { error: "Failed to create draft" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        draft: withDraftExtras(draftResult, store?.slug ?? null),
      });
    } catch (error: unknown) {
      logger.error("[STOREFRONT_DRAFT_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const activeTemplateId = getString(body.activeTemplateId);
      const themeConfig = body.themeConfig;
      const sectionConfig = body.sectionConfig;
      const sectionOrder = Array.isArray(body.sectionOrder)
        ? (body.sectionOrder as string[])
        : undefined;
      const assets = body.assets;

      if (activeTemplateId) {
        const exists = await prisma.templateManifest.findUnique({
          where: { id: activeTemplateId },
          select: { id: true },
        });
        if (!exists) {
          return NextResponse.json(
            { error: "Invalid activeTemplateId" },
            { status: 400 },
          );
        }

        const requiredPlan = getRequiredPlan(activeTemplateId) ?? "free";
        const store = await prisma.store.findUnique({
          where: { id: storeId },
          select: { plan: true },
        });
        if (!canUseTemplate(store?.plan, requiredPlan)) {
          const requiredDisplay =
            String(requiredPlan).charAt(0).toUpperCase() +
            String(requiredPlan).slice(1);
          return NextResponse.json(
            {
              error: "TEMPLATE_LOCKED",
              requiredPlan,
              currentPlan: normalizePlan(store?.plan),
              message: `Upgrade to ${requiredDisplay} to unlock this template`,
            },
            { status: 403 },
          );
        }
      }

      // Build update object with only provided fields
      const updateData: Prisma.StorefrontDraftUpdateInput = {
        ...(activeTemplateId !== undefined ? { activeTemplateId } : {}),
        ...(themeConfig !== undefined
          ? { themeConfig: themeConfig as Prisma.InputJsonValue }
          : {}),
        ...(sectionConfig !== undefined
          ? { sectionConfig: sectionConfig as Prisma.InputJsonValue }
          : {}),
        ...(sectionOrder !== undefined
          ? { sectionOrder: sectionOrder as string[] }
          : {}),
        ...(assets !== undefined
          ? { assets: assets as Prisma.InputJsonValue }
          : {}),
      };

      const [updatedDraft, store] = await Promise.all([
        prisma.storefrontDraft.update({
          where: { storeId },
          data: updateData,
          include: { template: true },
        }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: { slug: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        draft: withDraftExtras(updatedDraft, store?.slug ?? null),
      });
    } catch (error: unknown) {
      logger.error("[STOREFRONT_DRAFT_PATCH]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
