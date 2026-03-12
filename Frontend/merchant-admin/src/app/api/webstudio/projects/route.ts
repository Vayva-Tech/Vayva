import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders, urls } from "@vayva/shared";

const WEBSTUDIO_BASE_URL = urls.webstudioBase();
const WEBSTUDIO_TOKEN = process.env?.WEBSTUDIO_API_TOKEN;

export const POST = withVayvaAPI(PERMISSIONS.TEMPLATES_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
  try {
    if (!WEBSTUDIO_TOKEN) {
      logger.error("WEBSTUDIO_API_TOKEN not configured", { requestId: correlationId, storeId });
      return NextResponse.json(
        { error: "Webstudio integration is not configured", requestId: correlationId },
        { status: 503, headers: standardHeaders(correlationId) },
      );
    }

    const body = await req.json();
    const { templateProjectId, name } = body;

    if (!templateProjectId) {
      return NextResponse.json(
        { error: "templateProjectId is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const project = await prisma.templateProject?.findFirst({
      where: { id: templateProjectId, storeId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Template project not found", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) },
      );
    }

    // If already linked to a Webstudio project, return existing
    if (project.webstudioProjectId) {
      return NextResponse.json(
        {
          success: true,
          data: {
            projectId: project.webstudioProjectId,
            editorUrl: `${WEBSTUDIO_BASE_URL}/builder/${project.webstudioProjectId}`,
          },
          requestId: correlationId,
        },
        { headers: standardHeaders(correlationId) },
      );
    }

    // Phase 1: Create a placeholder project ID
    // In Phase 2 this will call the Webstudio API to create a real project
    const webstudioProjectId = `ws_${project.id}`;
    const editorUrl = `${WEBSTUDIO_BASE_URL}/builder/${webstudioProjectId}`;

    // Get store branding to sync (Rule 52.3)
    const store = await prisma.store?.findUnique({
      where: { id: storeId },
      select: { branding: true }
    });

    const branding = (store?.branding && typeof store.branding === "object"
      ? (store.branding as Record<string, unknown>)
      : {}) as Record<string, unknown>;

    const primaryColor = typeof branding.primaryColor === "string" ? branding.primaryColor : undefined;
    const accentColor = typeof branding.accentColor === "string" ? branding.accentColor : undefined;
    const logoUrl = typeof branding.logoUrl === "string" ? branding.logoUrl : undefined;

    const projectConfig = (project.config && typeof project.config === "object"
      ? (project.config as Record<string, unknown>)
      : {}) as Record<string, unknown>;

    const mergedConfig = {
      ...projectConfig,
      branding: {
        primaryColor,
        accentColor,
        logoUrl,
      }
    };

    await prisma.templateProject?.updateMany({
      where: { id: project.id, storeId },
      data: {
        webstudioProjectId,
        source: "WEBSTUDIO",
        config: mergedConfig as unknown as Prisma.InputJsonValue,
      },
    });

    logger.info("Webstudio project linked", {
      templateProjectId: project.id,
      webstudioProjectId,
      storeId,
      requestId: correlationId,
    });

    return NextResponse.json(
      {
        success: true,
        data: { projectId: webstudioProjectId, editorUrl },
        requestId: correlationId,
      },
      { status: 201, headers: standardHeaders(correlationId) },
    );
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to create Webstudio project", {
      error: message,
      stack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to create Webstudio project", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) },
    );
  }
});
