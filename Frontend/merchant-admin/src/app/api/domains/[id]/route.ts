import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export const runtime = "nodejs";

export const DELETE = withVayvaAPI(PERMISSIONS.DOMAINS_MANAGE, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  const mapping = await prisma.domainMapping?.findFirst({ where: { id, storeId } });
  if (!mapping) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const mappingStatus = mapping.status;
  if (mappingStatus?.toLowerCase() === "active") {
    return NextResponse.json({ error: "Cannot delete a verified domain" }, { status: 409, headers: { "Cache-Control": "no-store" } });
  }

  await prisma.domainMapping?.delete({ where: { id: mapping.id } });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
});
