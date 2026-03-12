import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { ReviewStatus, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set([
  "PUBLISHED",
  "ARCHIVED",
  "PENDING",
  "REJECTED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseReviewStatus(status: string): ReviewStatus | null {
  if (status === "ARCHIVED") return ReviewStatus.HIDDEN;
  const allowed = Object.values(ReviewStatus) as string[];
  return allowed.includes(status) ? (status as ReviewStatus) : null;
}

export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    try {
      const { id } = await params;
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const status = (getString(body.status) || "").toUpperCase();

      if (!ALLOWED_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const existing = await prisma.review.findFirst({
        where: { id, storeId },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 },
        );
      }

      const parsedStatus = parseReviewStatus(status);
      if (!parsedStatus) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      await prisma.review.update({
        where: { id },
        data: { status: parsedStatus },
      });

      return NextResponse.json(
        { success: true },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[REVIEW_STATUS_PATCH]", error);
      return NextResponse.json(
        { error: "Failed to update review" },
        { status: 500 },
      );
    }
  },
);
