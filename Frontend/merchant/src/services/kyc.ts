import { api } from '@/lib/api-client';
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

        // Call backend API to submit KYC for review
        const response = await api.post('/kyc/submit', {
            storeId,
            nin: encrypt(data.nin),
            cacNumber: data.cacNumber,
            consent: data.consent,
            auditEntry,
        });

        return {
            success: response.success,
            status: response.data?.status || 'pending',
            recordId: response.data?.id,
        };
    }
}

export const kycService = new KycService();
