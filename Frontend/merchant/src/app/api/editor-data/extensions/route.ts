// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const store = await prisma.store?.findUnique({
        where: { id: storeId },
        select: { industrySlug: true },
      });

      const baseExtensionIds = getBaseExtensionIds(store?.industrySlug || "");

      const addOns =
        (await prisma.storeAddOn?.findMany({
          where: {
            storeId,
            status: "ACTIVE" as any,
          },
          select: { extensionId: true },
        })) || [];

      // Use extensionId from StoreAddOn
      const addOnExtensionIds = addOns
        .map((a) => a.extensionId)
        .filter((v): v is string => typeof v === "string" && v.length > 0);

      const enabledExtensionIds = Array.from(
        new Set([...baseExtensionIds, ...addOnExtensionIds]),
      );

      return NextResponse.json(
        { data: enabledExtensionIds },
        { headers: { "Cache-Control": "no-store" } },
      );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/editor-data/extensions", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
