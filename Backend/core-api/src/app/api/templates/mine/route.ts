import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import {
  logger,
  standardHeaders,
  VAYVA_DESIGN_TOKENS,
  TEMPLATE_PACKS
} from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (_req, { storeId, correlationId }) => {
    try {
      const projects = await prisma.templateProject.findMany({
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
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to fetch template projects", {
        error: errMsg,
        stack: errStack,
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        {
          error: "Failed to fetch template projects",
          requestId: correlationId,
        },
        { status: 500, headers: standardHeaders(correlationId) },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEMPLATES_MANAGE,
  async (req, { storeId, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const name = getString(body.name);
      const source = getString(body.source);
      const basedOnSystemTemplateKey = getString(body.basedOnSystemTemplateKey);
      const webstudioProjectId = getString(body.webstudioProjectId);
      const thumbnailUrl = getString(body.thumbnailUrl);

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name is required", requestId: correlationId },
          { status: 400, headers: standardHeaders(correlationId) },
        );
      }

      const existing = await prisma.templateProject.findUnique({
        where: { storeId_name: { storeId, name: name.trim() } },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "A template with this name already exists",
            requestId: correlationId,
          },
          { status: 409, headers: standardHeaders(correlationId) },
        );
      }

      // Apply Starter Kit if creating for Webstudio
      let config = {};
      if (source === "WEBSTUDIO") {
        const pack =
          TEMPLATE_PACKS.find(
            (p) => p.systemTemplateKey === basedOnSystemTemplateKey,
          ) || TEMPLATE_PACKS[0];
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

      const project = await prisma.templateProject.create({
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
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to create template project", {
        error: errMsg,
        stack: errStack,
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        {
          error: "Failed to create template project",
          requestId: correlationId,
        },
        { status: 500, headers: standardHeaders(correlationId) },
      );
    }
  },
);
