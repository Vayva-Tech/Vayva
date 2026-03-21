// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { checkRateLimitCustom } from "@/lib/rate-limit";
import { FlagService } from "@/lib/flags/flagService";
import { logger, standardHeaders, computeKycStatus, isRegisteredBusiness } from "@vayva/shared";
import { prisma, KycStatus } from "@vayva/db";
import { encrypt } from "@/lib/security/encryption";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
        const userId = user.id;

        // Kill Switch & Rate Limit
        const isEnabled = await FlagService.isEnabled("kyc.enabled", {
            merchantId: storeId,
        });
        if (!isEnabled) {
            return NextResponse.json(
                { error: "Identity verification is temporarily paused", requestId: correlationId },
                { status: 503, headers: standardHeaders(correlationId) },
            );
        }

        await checkRateLimitCustom(userId, "kyc_cac_submit", 3, 3600);

        const { cacNumber, consent } = body;
        const ip = request.headers?.get("x-forwarded-for") || "unknown";

        if (!cacNumber || !consent) {
            return NextResponse.json(
                { error: "Missing required fields (cacNumber, consent)", requestId: correlationId },
                { status: 400, headers: standardHeaders(correlationId) },
            );
        }

        // Validate CAC number format (typically 7-8 digits for RC numbers)
        const trimmedCac = cacNumber.trim();
        if (!/^(RC|BN)?\d{5,8}$/i.test(trimmedCac)) {
            return NextResponse.json(
                { error: "Invalid CAC registration number format", requestId: correlationId },
                { status: 400, headers: standardHeaders(correlationId) },
            );
        }

        // Ensure the store is marked as a registered business
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { businessType: true },
        });

        if (!isRegisteredBusiness(store?.businessType)) {
            return NextResponse.json(
                { error: "CAC submission is only required for registered businesses", requestId: correlationId },
                { status: 400, headers: standardHeaders(correlationId) },
            );
        }

        // Fetch existing KYC record to read sibling check statuses
        const existing = await prisma.kycRecord?.findUnique({ where: { storeId } });
        const ninStatusCurrent = existing?.ninStatus || "NOT_STARTED";
        const bvnStatusCurrent = existing?.bvnStatus || "NOT_STARTED";

        // CAC goes to PENDING (manual ops review)
        const newCacStatus = "PENDING";

        // Compute overall status via state machine
        const overallStatus = computeKycStatus({
            checks: {
                ninStatus: ninStatusCurrent,
                bvnStatus: bvnStatusCurrent,
                cacStatus: newCacStatus,
            },
            isRegisteredBusiness: true,
        });

        // Masked audit entry
        const cacLast4 = trimmedCac.slice(-4);
        const auditEntry = {
            timestamp: new Date().toISOString(),
            action: "CAC_SUBMITTED",
            idLast4: cacLast4,
            ipAddress: ip,
            actorId: userId,
        };

        // Upsert KYC record
        await prisma.kycRecord?.upsert({
            where: { storeId },
            create: {
                storeId,
                ninLast4: "",
                bvnLast4: "",
                cacNumberEncrypted: encrypt(trimmedCac),
                cacStatus: newCacStatus as KycStatus,
                status: overallStatus as KycStatus,
                audit: [auditEntry],
            },
            update: {
                cacNumberEncrypted: encrypt(trimmedCac),
                cacStatus: newCacStatus as KycStatus,
                status: overallStatus as KycStatus,
                audit: { push: auditEntry },
            },
        });

        // Update store + wallet cache
        await Promise.all([
            prisma.store?.update({
                where: { id: storeId },
                data: { kycStatus: overallStatus as KycStatus },
            }),
            prisma.wallet?.upsert({
                where: { storeId },
                create: { storeId, kycStatus: overallStatus as KycStatus },
                update: { kycStatus: overallStatus as KycStatus },
            }),
        ]);

        // Audit log — masked
        await prisma.auditLog?.create({
            data: {
                app: "merchant",
                targetStoreId: storeId,
                actorUserId: userId,
                action: "KYC_CAC_SUBMITTED",
                targetType: "system",
                targetId: storeId,
                ip,
                requestId: correlationId,
                metadata: {
                    cacLast4,
                    overallStatus,
                },
            },
        }).catch(() => {});

        return NextResponse.json(
            { success: true, cacStatus: newCacStatus, overallStatus, requestId: correlationId },
            { headers: standardHeaders(correlationId) },
        );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/kyc/cac/submit", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
