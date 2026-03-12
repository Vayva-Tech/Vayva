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

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === "string");
  return items;
}

/**
 * GET /api/leads/[id]
 */
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (_req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      const lead = await prisma.customer.findFirst({
        where: {
          id,
          storeId,
        },
      });

      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      return NextResponse.json(
        { lead },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[LEAD_GET_BY_ID]", error, { storeId, leadId: id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * PATCH /api/leads/[id]
 */
export const PATCH = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};

      const firstName = getString(body.firstName);
      const lastName = getString(body.lastName);
      const email = getString(body.email);
      const phone = getString(body.phone);
      const notes = getString(body.notes);
      const status = getString(body.status);
      const tags = getStringArray(body.tags);

      const existing = await prisma.customer.findFirst({
        where: {
          id,
          storeId,
        },
        select: { tags: true },
      });

      if (!existing) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      // Update status in tags
      let updatedTags = Array.isArray(existing.tags)
        ? (existing.tags as string[])
        : [];
      if (status) {
        updatedTags = updatedTags.filter(
          (t: string) => !t.startsWith("status:"),
        );
        updatedTags.push(`status:${status}`);
      }
      if (tags) {
        updatedTags = [...new Set([...updatedTags, ...tags])];
      }

      const updated = await prisma.customer.updateMany({
        where: { id, storeId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(notes !== undefined && { notes }),
          tags: updatedTags,
        },
      });

      if (updated.count === 0) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      const lead = await prisma.customer.findFirst({ where: { id, storeId } });
      return NextResponse.json({ lead });
    } catch (error: unknown) {
      logger.error("[LEAD_PATCH_BY_ID]", error, {
        storeId,
        leadId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/leads/[id]
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (_req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      const deleted = await prisma.customer.deleteMany({
        where: { id, storeId },
      });
      if (deleted.count === 0) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[LEAD_DELETE_BY_ID]", error, {
        storeId,
        leadId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
