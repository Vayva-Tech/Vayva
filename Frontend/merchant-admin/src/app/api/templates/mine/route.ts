import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders, VAYVA_DESIGN_TOKENS, TEMPLATE_PACKS } from "@vayva/shared";

export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (_req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
  try {
    const projects = await prisma.templateProject?.findMany({
      where: { storeId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: projects,
        meta: { count: projects.length },
        requestId: correlationId,
      },
      { headers: standardHeaders(correlationId) },
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to fetch template projects", {
      error: errorMessage,
      stack: errorStack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch template projects", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) },
    );
  }
});

export const POST = withVayvaAPI(PERMISSIONS.TEMPLATES_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
  try {
    const body = await req.json();
    const { name, source, basedOnSystemTemplateKey, webstudioProjectId, thumbnailUrl } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const existing = await prisma.templateProject?.findUnique({
      where: { storeId_name: { storeId, name: name.trim() } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A template with this name already exists", requestId: correlationId },
        { status: 409, headers: standardHeaders(correlationId) },
      );
    }

    // Apply Starter Kit if creating for Webstudio
    let config = {};
    if (source === "WEBSTUDIO") {
      const pack = TEMPLATE_PACKS.find((p: any) => p.systemTemplateKey === basedOnSystemTemplateKey) || TEMPLATE_PACKS[0];
      config = {
        tokens: VAYVA_DESIGN_TOKENS,
        pack: {
          id: pack.id,
          name: pack.name,
          pages: pack.pages,
          sections: pack.sections,
        },
        commerceSafe: true,
      };
    }

    const project = await prisma.templateProject?.create({
      data: {
        storeId,
        name: name.trim(),
        source: source === "WEBSTUDIO" ? "WEBSTUDIO" : "NATIVE",
        basedOnSystemTemplateKey: basedOnSystemTemplateKey || null,
        webstudioProjectId: webstudioProjectId || null,
        thumbnailUrl: thumbnailUrl || null,
        status: "DRAFT",
        config: config,
      },
    });

    logger.info("Template project created with Vayva Starter Kit", {
      projectId: project.id,
      storeId,
      name: project.name,
      requestId: correlationId,
    });

    return NextResponse.json(
      { success: true, data: project, requestId: correlationId },
      { status: 201, headers: standardHeaders(correlationId) },
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to create template project", {
      error: errorMessage,
      stack: errorStack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to create template project", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) },
    );
  }
});
