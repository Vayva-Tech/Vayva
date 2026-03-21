import { prisma, type KycStatus } from "@vayva/db";
import { encrypt } from "@/lib/security/encryption";

export class KycService {
    async submitForReview(storeId: string, data: {
        nin: string;
        cacNumber?: string;
        consent: boolean;
        ipAddress: string;
        actorUserId: string;
    }) {
        const ninLast4 = data.nin?.slice(-4);

        const auditEntry = {
            timestamp: new Date().toISOString(),
            action: "MANUAL_SUBMISSION",
            method: "NIN",
            result: "PENDING",
            ipAddress: data.ipAddress,
            actorUserId: data.actorUserId,
        };

        const record = await prisma.kycRecord?.upsert({
            where: { storeId },
            create: {
                storeId,
                ninLast4,
                bvnLast4: "",
                status: "PENDING",
                fullNinEncrypted: encrypt(data.nin),
                audit: [auditEntry],
            },
            update: {
                ninLast4,
                status: "PENDING",
                fullNinEncrypted: encrypt(data.nin),
                audit: { push: auditEntry },
            },
        });

        await prisma.store?.update({
            where: { id: storeId },
            data: { kycStatus: "PENDING" },
        });

        return {
            success: true,
            status: "pending" as KycStatus,
            recordId: record.id,
        };
    }
}

export const kycService = new KycService();
