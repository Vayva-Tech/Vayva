import { api } from '@/lib/api-client';

export class EscalationService {
    /**
     * Trigger a handoff from AI to Human Support
     */
    static async triggerHandoff(params: Record<string, any>) {
        try {
            const response = await api.post('/support/escalation/handoff', params);
            return response.data;
        }
        catch (error) {
            console.error('[EscalationService] Failed to trigger handoff', error);
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static mapTriggerToPriority(trigger: unknown) {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
                return "URGENT";
            case "FRAUD_RISK":
                return "URGENT";
            case "BILLING_ERROR":
                return "HIGH";
            case "SENTIMENT":
                return "HIGH";
            default:
                return "MEDIUM";
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static mapTriggerToCategory(trigger: unknown) {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
                return "PAYMENT";
            case "FRAUD_RISK":
                return "FRAUD";
            case "BILLING_ERROR":
                return "BILLING";
            case "SENTIMENT":
                return "OTHER";
            default:
                return "GENERAL";
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static mapTriggerToType(trigger: unknown) {
        switch (trigger) {
            case "BILLING_ERROR":
                return "BILLING";
            case "PAYMENT_DISPUTE":
                return "BILLING";
            default:
                return "GENERAL";
        }
    }
}
