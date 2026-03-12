import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.KYC_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
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
    }
    catch (error) {
        logger.error("[KYC_STATUS_GET] Failed to fetch KYC status", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch KYC status" }, { status: 500 });
    }
});
