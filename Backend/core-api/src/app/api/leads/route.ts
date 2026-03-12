import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * GET /api/leads
 * List all leads for automotive/real estate
 */
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const source = searchParams.get("source");

      const where: Prisma.CustomerWhereInput = {
        storeId,
        ...(status && { tags: { has: `status:${status}` } }),
        ...(source && { tags: { has: `source:${source}` } }),
      };

      const leads = await prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        {
          leads: leads.map((l) => ({
            id: l.id,
            name: `${l.firstName} ${l.lastName}`.trim(),
            email: l.email,
            phone: l.phone,
            notes: l.notes,
            tags: l.tags,
            status:
              l.tags
                ?.find((t: string) => t.startsWith("status:"))
                ?.replace("status:", "") || "new",
            source:
              l.tags
                ?.find((t: string) => t.startsWith("source:"))
                ?.replace("source:", "") || "direct",
            createdAt: l.createdAt,
          })),
          total: leads.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[LEADS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * POST /api/leads
 * Create a new lead
 */
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const firstName = getString(body.firstName);
      const lastName = getString(body.lastName);
      const email = getString(body.email);
      const phone = getString(body.phone);
      const notes = getString(body.notes);
      const source = getString(body.source);
      const interestedIn = getString(body.interestedIn);

      if (!firstName && !email && !phone) {
        return NextResponse.json(
          { error: "At least name, email, or phone is required" },
          { status: 400 },
        );
      }

      const tags = ["status:new"];
      if (source) tags.push(`source:${source}`);
      if (interestedIn) tags.push(`interest:${interestedIn}`);

      const lead = await prisma.customer.create({
        data: {
          storeId,
          firstName: firstName || "",
          lastName: lastName || "",
          email: email || null,
          phone: phone || null,
          notes: notes || null,
          tags,
        },
      });

      return NextResponse.json({ lead }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[LEADS_POST]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
