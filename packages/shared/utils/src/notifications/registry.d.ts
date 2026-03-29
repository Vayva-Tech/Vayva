export type NotificationType = "KYC_REQUIRED" | "KYC_FAILED" | "KYC_VERIFIED" | "PAYOUT_DETAILS_MISSING" | "PAYOUT_BLOCKED" | "INTEGRATION_DISCONNECTED_WHATSAPP" | "INTEGRATION_DISCONNECTED_PAYMENTS" | "INTEGRATION_DISCONNECTED_DELIVERY" | "WEBHOOK_FAILURE_SPIKE" | "WARNING_ISSUED" | "RESTRICTION_APPLIED" | "APPEAL_STATUS_UPDATED";
export interface NotificationMetadata {
    title: string;
    message: string;
    ctaLabel: string;
    ctaLink: string;
    category: "account" | "payments" | "system";
    severity: "info" | "warning" | "critical";
}
export declare const NOTIFICATION_REGISTRY: Record<NotificationType, NotificationMetadata>;
//# sourceMappingURL=registry.d.ts.map