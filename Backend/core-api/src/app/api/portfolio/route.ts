import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_VIEW,
  async (req, { storeId }) => {
    try {
      const projects = await prisma.portfolioProject.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        { projects },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[PORTFOLIO_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const title = getString(body.title);
      const description = getString(body.description);
      if (!title)
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 },
        );
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();
      const project = await prisma.portfolioProject.create({
        data: {
          storeId,
          title,
          description,
          slug,
          images: [],
        },
      });
      return NextResponse.json({ project });
    } catch (error) {
      logger.error("[PORTFOLIO_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
