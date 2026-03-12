import { NextResponse } from "next/server";
export const runtime = "nodejs";

import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { verifyDomainDns } from "@/lib/jobs/domain-verification";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
export const POST = withVayvaAPI(
  PERMISSIONS.DOMAINS_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};
      const domainMappingId = getString(body.domainMappingId) ?? "";
      if (!domainMappingId) {
        return NextResponse.json(
          { error: "Domain mapping ID required" },
          { status: 400 },
        );
      }

      const pending = await prisma.domainMapping.updateMany({
        where: { id: domainMappingId, storeId },
        data: { status: "pending" },
      });
      if (pending.count === 0) {
        return NextResponse.json(
          { error: "Domain not found" },
          { status: 404 },
        );
      }

      await verifyDomainDns(domainMappingId);

      const updated = await prisma.domainMapping.findFirst({
        where: { id: domainMappingId, storeId },
        select: { id: true, status: true, provider: true },
      });

      return NextResponse.json({
        message: "Verification completed",
        status: updated?.status || "pending",
        provider: updated?.provider || null,
      });
    } catch (error: unknown) {
      logger.error("[ACCOUNT_DOMAINS_VERIFY_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to verify domain" },
        { status: 500 },
      );
    }
  },
);
