import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

export const DELETE = withVayvaAPI(PERMISSIONS.TEMPLATES_MANAGE, async (req: NextRequest, { storeId, correlationId, params }: { storeId: string; correlationId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id as string;

    if (!id) {
      return NextResponse.json(
        { error: "Template project ID is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const project = await prisma.templateProject.findFirst({
      where: { id, storeId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Template project not found", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) },
      );
    }

    await prisma.templateProject.delete({ where: { id } });

    logger.info("Template project deleted", {
      projectId: id,
      storeId,
      requestId: correlationId,
    });

    return NextResponse.json(
      { success: true, requestId: correlationId },
      { headers: standardHeaders(correlationId) },
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to delete template project", {
      error: errorMessage,
      stack: errorStack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to delete template project", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) },
    );
  }
});
