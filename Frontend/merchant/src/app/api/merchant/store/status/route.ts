import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
    handleApiError(error, { endpoint: "/merchant/store/status", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
