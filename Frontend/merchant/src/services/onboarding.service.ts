import { api } from '@/lib/api-client';
import { OnboardingState, OnboardingUpdatePayload, OnboardingData, KycData } from "@/types/onboarding";
import { encrypt } from "@/lib/security/encryption";

export class OnboardingService {
    static async getState(storeId: string): Promise<OnboardingState> {
        const response = await api.get(`/onboarding/${storeId}/state`);
        return response.data || {};
    }
    
    static async updateState(storeId: string, payload: OnboardingUpdatePayload): Promise<OnboardingState> {
        // Prepare sanitized data for backend
        const { step, data, isComplete } = payload;
        
        // Sanitize PII from frontend data before sending
        let sanitizedData = data ? JSON.parse(JSON.stringify(data)) : undefined;
        if (sanitizedData?.kyc) {
            delete sanitizedData.kyc.nin;
            delete sanitizedData.kyc.bvn;
        }
        
        const response = await api.patch(`/onboarding/${storeId}/state`, {
            step,
            data: sanitizedData,
            isComplete,
        });
        
        return response.data || {};
    }
}
