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
            select: {
                kycStatus: true,
                isLive: true,
                payoutsEnabled: true,
                plan: true,
            },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        return NextResponse.json(store, {
            headers: { "Cache-Control": "no-store" },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/store/status", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
