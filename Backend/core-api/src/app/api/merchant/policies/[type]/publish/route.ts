import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { PolicyType, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parsePolicyType(value: string): PolicyType | null {
  const normalized = value.toUpperCase().replace(/-/g, "_");
  const allowed = Object.values(PolicyType) as string[];
  return allowed.includes(normalized) ? (normalized as PolicyType) : null;
}

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const typeParam = getString(body.type) ?? "";
      const type = typeParam ? parsePolicyType(typeParam) : null;
      if (!type) {
        return NextResponse.json(
          { error: "Invalid policy type" },
          { status: 400 },
        );
      }
      const policy = await prisma.merchantPolicy.update({
        where: {
          storeId_type: {
            storeId,
            type,
          },
        },
        data: {
          status: "PUBLISHED",
          publishedVersion: { increment: 1 },
          publishedAt: new Date(),
          lastUpdatedLabel: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        },
      });
      return NextResponse.json({ policy });
    } catch (error: unknown) {
      logger.error("[POLICIES_TYPE_PUBLISH_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
