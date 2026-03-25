import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const store = await prisma.store?.findUnique({
            where: { id: storeId },
            include: {
                kycRecord: true,
            },
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        const kycRecord = store.kycRecord;
        return NextResponse.json({
            status: kycRecord?.status || "NOT_STARTED",
            businessType: kycRecord?.cacNumberEncrypted ? "REGISTERED" : "INDIVIDUAL",
            documents: kycRecord
                ? [
                    {
                        type: "BVN",
                        status: kycRecord.fullBvnEncrypted ? "UPLOADED" : "PENDING",
                        uploadedAt: kycRecord.createdAt,
                    },
                    {
                        type: "ID",
                        status: kycRecord.fullNinEncrypted ? "UPLOADED" : "PENDING",
                        uploadedAt: kycRecord.createdAt,
                    },
                ]
                : [],
            canWithdraw: kycRecord?.status === "VERIFIED",
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/kyc/status", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
