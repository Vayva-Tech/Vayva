import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getSnapshotObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getSnapshotJson(
  value: unknown,
  fallback: Prisma.InputJsonValue,
): Prisma.InputJsonValue {
  const snapshot = value as Prisma.InputJsonValue | null | undefined;
  return snapshot ?? fallback;
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === "string");
  return items;
}

function withDraftExtras(draft: unknown, storeSlug: string | null) {
  const draftRecord = isRecord(draft) ? draft : {};
  const templateValue = draftRecord.template;
  const template = isRecord(templateValue)
    ? {
        ...templateValue,
        displayName:
          getString(templateValue.displayName) ||
          getString(templateValue.name) ||
          getString(templateValue.id),
      }
    : null;

  return {
    ...draftRecord,
    store: { slug: storeSlug },
    template,
  };
}

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};
      const versionId = getString(body.versionId);

      if (!versionId) {
        return NextResponse.json(
          { error: "Version ID required" },
          { status: 400 },
        );
      }

      // Fetch the historical version
      const historyEntry = await prisma.merchantThemeHistory.findFirst({
        where: { id: versionId, storeId },
      });

      if (!historyEntry) {
        return NextResponse.json(
          { error: "Version not found" },
          { status: 404 },
        );
      }

      // configSnapshot contains the full theme config from history
      const configSnapshot = getSnapshotObject(historyEntry.configSnapshot);

      // Update the draft with the historical config
      const themeConfig = getSnapshotJson(configSnapshot.themeConfig, {});
      const sectionConfig = getSnapshotJson(configSnapshot.sectionConfig, {});
      const sectionOrder = getStringArray(configSnapshot.sectionOrder) ?? [];
      const assets = getSnapshotJson(configSnapshot.assets, {});

      const [draft, store] = await Promise.all([
        prisma.storefrontDraft.upsert({
          where: { storeId },
          create: {
            storeId,
            activeTemplateId: historyEntry.templateId,
            themeConfig,
            sectionConfig,
            sectionOrder,
            assets,
          },
          update: {
            activeTemplateId: historyEntry.templateId,
            themeConfig,
            sectionConfig,
            sectionOrder,
            assets,
          },
          include: { template: true },
        }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: { slug: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        draft: withDraftExtras(draft, store?.slug ?? null),
      });
    } catch (error: unknown) {
      logger.error("[STOREFRONT_ROLLBACK_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
