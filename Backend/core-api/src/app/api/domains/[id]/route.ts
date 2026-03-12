import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

function _isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const DELETE = withVayvaAPI(
  PERMISSIONS.DOMAINS_MANAGE,
  async (_req, { storeId, params }) => {
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );

    const mapping = await prisma.domainMapping.findFirst({
      where: { id, storeId },
    });
    if (!mapping)
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );

    if (String(mapping.status).toUpperCase() === "VERIFIED") {
      return NextResponse.json(
        { error: "Cannot delete a verified domain" },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    await prisma.domainMapping.delete({ where: { id: mapping.id } });
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  },
);
