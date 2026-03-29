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
            select: { settings: true },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings: any = store?.settings || {};
        const policies = settings.policies || {
            refundPolicy: "",
            shippingPolicy: "",
            termsOfService: "",
            privacyPolicy: "",
        };
        return NextResponse.json(policies, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/store/policies", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
