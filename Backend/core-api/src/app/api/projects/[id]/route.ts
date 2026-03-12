import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma } from "@vayva/db";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * GET /api/projects/[id]
 */
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (_req, { storeId, params }) => {
    const { id } = await params;

    const project = await prisma.product.findFirst({
      where: {
        id,
        storeId,
        productType: "PROJECT",
      },
      include: {
        productImages: { orderBy: { position: "asc" } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      { project },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  },
);

/**
 * PATCH /api/projects/[id]
 */
export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_EDIT,
  async (req, { storeId, params }) => {
    const { id } = await params;

    const body = getObject(await req.json().catch(() => ({})));
    const { title, description, status, client, year, category, tags } = body;
    const parsedTags = Array.isArray(tags)
      ? tags.filter((tag): tag is string => typeof tag === "string")
      : undefined;

    const existing = await prisma.product.findFirst({
      where: {
        id,
        storeId,
        productType: "PROJECT",
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const existingMeta = getObject(existing.metadata);

    const project = await prisma.product.update({
      where: { id },
      data: {
        ...(getString(title) && { title: getString(title) }),
        ...(description !== undefined && { description: String(description) }),
        ...(getString(status) && { status: getString(status) as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" }),
        ...(parsedTags !== undefined && { tags: parsedTags }),
        metadata: {
          ...existingMeta,
          ...(client !== undefined && { client }),
          ...(year !== undefined && { year }),
          ...(category !== undefined && { category }),
        } as Prisma.InputJsonValue,
      },
      include: {
        productImages: true,
      },
    });

    return NextResponse.json({ project });
  },
);

/**
 * DELETE /api/projects/[id]
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (_req, { storeId, params }) => {
    const { id } = await params;

    const existing = await prisma.product.findFirst({
      where: {
        id,
        storeId,
        productType: "PROJECT",
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  },
);
