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
    handleApiError(error, { endpoint: "/api/store/policies", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
