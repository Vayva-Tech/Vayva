import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

export const POST = withVayvaAPI(PERMISSIONS.TEMPLATES_MANAGE, async (req: NextRequest, { storeId, correlationId, params }: { storeId: string; correlationId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id as string;

    if (!id) {
      return NextResponse.json(
        { error: "Template project ID is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const original = await prisma.templateProject.findFirst({
      where: { id, storeId },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Template project not found", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) },
      );
    }

    // Generate unique name
    let copyName = `${original.name} (Copy)`;
    let suffix = 2;
    while (await prisma.templateProject.findUnique({ where: { storeId_name: { storeId, name: copyName } } })) {
      copyName = `${original.name} (Copy ${suffix})`;
      suffix++;
    }

    const duplicate = await prisma.templateProject.create({
      data: {
        storeId,
        name: copyName,
        source: original.source,
        basedOnSystemTemplateKey: original.basedOnSystemTemplateKey,
        webstudioProjectId: null,
        thumbnailUrl: original.thumbnailUrl,
        status: "DRAFT",
      },
    });

    logger.info("Template project duplicated", {
      originalId: id,
      duplicateId: duplicate.id,
      storeId,
      requestId: correlationId,
    });

    return NextResponse.json(
      { success: true, data: duplicate, requestId: correlationId },
      { status: 201, headers: standardHeaders(correlationId) },
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to duplicate template project", {
      error: errorMessage,
      stack: errorStack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to duplicate template project", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) },
    );
  }
});
