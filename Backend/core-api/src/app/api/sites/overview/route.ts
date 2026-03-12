import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders, getSystemTemplateByKey } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (_req, { storeId, correlationId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          id: true,
          name: true,
          slug: true,
          isLive: true,
          logoUrl: true,
          plan: true,
          currentTemplateId: true,
          currentTemplateProjectId: true,
          currentSystemTemplateKey: true,
          currentDeploymentId: true,
          draftDeploymentId: true,
          settings: true,
          branding: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Store not found", requestId: correlationId },
          { status: 404, headers: standardHeaders(correlationId) },
        );
      }

      const settings = getObject(store.settings);
      const branding = getObject(store.branding);
      const currentTemplateKey =
        store.currentSystemTemplateKey ||
        getString(settings.currentTemplateKey) ||
        null;
      const currentTemplateProjectId =
        store.currentTemplateProjectId ||
        getString(settings.currentTemplateProjectId) ||
        null;
      const draftChanged = Boolean(settings.draftChanged);

      // Resolve template display info
      let templateInfo: {
        type: string;
        name: string;
        key?: string;
        id?: string;
        updatedAt?: string;
        thumbnailUrl?: string | null;
      } | null = null;

      if (currentTemplateKey) {
        const systemTemplate = getSystemTemplateByKey(currentTemplateKey);
        templateInfo = systemTemplate
          ? {
              type: "system",
              name: systemTemplate.name,
              key: systemTemplate.key,
              thumbnailUrl: systemTemplate.thumbnailPath,
            }
          : {
              type: "system",
              name: currentTemplateKey,
              key: currentTemplateKey,
            };
      } else if (currentTemplateProjectId) {
        const project = await prisma.templateProject.findFirst({
          where: { id: currentTemplateProjectId, storeId },
          select: { id: true, name: true, updatedAt: true, thumbnailUrl: true },
        });
        templateInfo = project
          ? {
              type: "custom",
              name: project.name,
              id: project.id,
              updatedAt: project.updatedAt.toISOString(),
              thumbnailUrl: project.thumbnailUrl,
            }
          : null;
      }

      // Fetch deployment history from StoreDeployment (Batch 52.1)
      const deployments = await prisma.storeDeployment.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      // Recent activity (historical publishes)
      const recentActivity = await prisma.publishHistory.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { createdAt: true, action: true, actorLabel: true },
      });

      const domain = `${store.slug}.vayva.ng`;

      return NextResponse.json(
        {
          success: true,
          data: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            domain,
            logoUrl: getString(branding.logoUrl) || store.logoUrl,
            branding,
            plan: store.plan,
            isLive: store.isLive,
            draftChanged,
            currentTemplate: templateInfo,
            currentDeploymentId: store.currentDeploymentId,
            draftDeploymentId: store.draftDeploymentId,
            deployments,
            lastPublished: recentActivity[0]
              ? {
                  at: recentActivity[0].createdAt,
                  action: recentActivity[0].action,
                }
              : null,
            recentActivity,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt,
          },
          requestId: correlationId,
        },
        { headers: standardHeaders(correlationId) },
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to fetch site overview", {
        error: errMsg,
        stack: errStack,
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        { error: "Failed to fetch site overview", requestId: correlationId },
        { status: 500, headers: standardHeaders(correlationId) },
      );
    }
  },
);
