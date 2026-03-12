export type NotificationType =
  | "KYC_REQUIRED"
  | "KYC_FAILED"
  | "KYC_VERIFIED"
  | "PAYOUT_DETAILS_MISSING"
  | "PAYOUT_BLOCKED"
  | "INTEGRATION_DISCONNECTED_WHATSAPP"
  | "INTEGRATION_DISCONNECTED_PAYMENTS"
  | "INTEGRATION_DISCONNECTED_DELIVERY"
  | "WEBHOOK_FAILURE_SPIKE"
  | "WARNING_ISSUED"
  | "RESTRICTION_APPLIED"
  | "APPEAL_STATUS_UPDATED";

export interface NotificationMetadata {
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
  category: "account" | "payments" | "system";
  severity: "info" | "warning" | "critical";
}

export const NOTIFICATION_REGISTRY: Record<
  NotificationType,
  NotificationMetadata
> = {
  KYC_REQUIRED: {
    title: "Identity Verification Required",
    message: "Complete your KYC verification to enable payments and payouts.",
    ctaLabel: "Verify Identity",
    ctaLink: "/settings/kyc",
    category: "account",
    severity: "critical",
  },
  KYC_FAILED: {
    title: "Verification Failed",
    message:
      "Your identity verification attempt was unsuccessful. Reason: {{reason}}",
    ctaLabel: "Try Again",
    ctaLink: "/settings/kyc",
    category: "account",
    severity: "critical",
  },
  KYC_VERIFIED: {
    title: "Identity Verified",
    message: "Great news! Your identity has been successfully verified.",
    ctaLabel: "View Account",
    ctaLink: "/settings/account",
    category: "account",
    severity: "info",
  },
  PAYOUT_DETAILS_MISSING: {
    title: "Settlement Details Missing",
    message: "Add your bank account details to receive payouts for your sales.",
    ctaLabel: "Add Bank Account",
    ctaLink: "/settings/payouts",
    category: "payments",
    severity: "warning",
  },
  PAYOUT_BLOCKED: {
    title: "Payout Blocked",
    message: "Your recent payout attempt was blocked due to {{reason}}.",
    ctaLabel: "Resolve Issue",
    ctaLink: "/settings/payouts",
    category: "payments",
    severity: "critical",
  },
  INTEGRATION_DISCONNECTED_WHATSAPP: {
    title: "WhatsApp Disconnected",
    message:
      "Your WhatsApp integration has been disconnected. Customers will not receive automated updates.",
    ctaLabel: "Reconnect",
    ctaLink: "/settings/integrations/whatsapp",
    category: "system",
    severity: "critical",
  },
  INTEGRATION_DISCONNECTED_PAYMENTS: {
    title: "Payment Provider Error",
    message:
      "We lost connection to your payment provider. Check your API keys.",
    ctaLabel: "Check Settings",
    ctaLink: "/settings/integrations/payments",
    category: "system",
    severity: "critical",
  },
  INTEGRATION_DISCONNECTED_DELIVERY: {
    title: "Logistics Error",
    message: "Your delivery partner account needs attention.",
    ctaLabel: "Manage Delivery",
    ctaLink: "/settings/integrations/logistics",
    category: "system",
    severity: "warning",
  },
  WEBHOOK_FAILURE_SPIKE: {
    title: "Integration Health Alert",
    message:
      "We detected a high number of webhook failures in the last few minutes.",
    ctaLabel: "View Logs",
    ctaLink: "/settings/integrations/webhooks",
    category: "system",
    severity: "warning",
  },
  WARNING_ISSUED: {
    title: "Account Warning",
    message: "A warning has been issued for your account: {{reason}}",
    ctaLabel: "View Details",
    ctaLink: "/appeals",
    category: "account",
    severity: "warning",
  },
  RESTRICTION_APPLIED: {
    title: "Account Restriction Applied",
    message: "Your account has been restricted: {{restriction}}. Contact support for assistance.",
    ctaLabel: "Submit Appeal",
    ctaLink: "/appeals",
    category: "account",
    severity: "critical",
  },
  APPEAL_STATUS_UPDATED: {
    title: "Appeal Status Update",
    message: "Your appeal has been updated: {{status}}. {{notes}}",
    ctaLabel: "View Appeal",
    ctaLink: "/appeals",
    category: "account",
    severity: "info",
  },
};
