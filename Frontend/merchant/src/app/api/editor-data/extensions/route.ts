import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

function getBaseExtensionIds(_industrySlug: string): string[] {
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { industrySlug: true },
    });

    const baseExtensionIds = getBaseExtensionIds(store?.industrySlug ?? "");

    const addOns = await prisma.storeAddOn.findMany({
      where: {
        storeId,
        status: "ACTIVE",
      },
      select: { extensionId: true },
    });

    const addOnExtensionIds = addOns
      .map((a) => a.extensionId)
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    const enabledExtensionIds = Array.from(new Set([...baseExtensionIds, ...addOnExtensionIds]));

    return NextResponse.json(
      { data: enabledExtensionIds },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/editor-data/extensions", operation: "GET" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
