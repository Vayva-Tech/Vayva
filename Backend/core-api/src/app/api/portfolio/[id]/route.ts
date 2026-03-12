import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const project = await prisma.portfolioProject.findUnique({
        where: { id, storeId },
        include: { comments: true },
      });
      if (!project)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(
        { project },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[PORTFOLIO_ID_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      // Destructure allowed fields
      const title = getString(body.title);
      const description = getString(body.description);
      const images = Array.isArray(body.images) ? body.images : undefined;
      const clientMode =
        typeof body.clientMode === "boolean" ? body.clientMode : undefined;
      const password = getString(body.password);

      // Verify existence and ownership first for update
      const existing = await prisma.portfolioProject.findUnique({
        where: { id, storeId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const project = await prisma.portfolioProject.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          images: images !== undefined ? images : undefined,
          clientMode: clientMode !== undefined ? clientMode : undefined,
          password: password !== undefined ? password : undefined,
        },
      });
      return NextResponse.json({ project });
    } catch (error: unknown) {
      logger.error("[PORTFOLIO_ID_PATCH]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      // Verify existence and ownership
      const existing = await prisma.portfolioProject.findUnique({
        where: { id, storeId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      await prisma.portfolioProject.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[PORTFOLIO_ID_DELETE]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
