import type {
  OrderCreatedParams,
  OrderCancelledParams,
  OrderRefundRequestedParams,
  OrderRefundApprovedParams,
  DeliveryFailedParams,
  DisputeOpenedParams,
  DisputeEvidenceRequiredParams,
  PlanChangedParams,
  KYCSubmittedParams,
} from "@/types/event-catalog";

export const EVENT_CATALOG = {
  // ---------------------------------------------------------------------------
  // ORDERS
  // ---------------------------------------------------------------------------
  "order.created": {
    notification: {
      title: "New Order Received",
      body: (p: OrderCreatedParams) => `Order #${p.orderNumber} for ${p.currency} ${p.totalAmount} was placed by ${p.customerName}.`,
      severity: "success",
      actionUrl: (_p: OrderCreatedParams, id: string) => `/dashboard/orders/${id}`,
    },
  },
  "order.paid": {
    audit: { action: "order.payment_confirmed" },
  },
  "order.cancelled": {
    audit: { action: "order.cancelled" },
    notification: {
      title: "Order Cancelled",
      body: (p: OrderCancelledParams) => `Order #${p.orderNumber} was cancelled.`,
      severity: "warning",
      actionUrl: (_p: OrderCancelledParams, id: string) => `/dashboard/orders/${id}`,
    },
  },
  "order.refund_requested": {
    notification: {
      title: "Refund Requested",
      body: (p: OrderRefundRequestedParams) => `Customer requested a refund for Order #${p.orderNumber}.`,
      severity: "warning",
      actionUrl: (_p: OrderRefundRequestedParams, id: string) => `/dashboard/orders/${id}/refunds`,
    },
    audit: { action: "refund.requested" },
  },
  "order.refund_approved": {
    notification: {
      title: "Refund Approved",
      body: (p: OrderRefundApprovedParams) => `Refund for Order #${p.orderNumber} has been approved.`,
      severity: "info",
      actionUrl: (_p: OrderRefundApprovedParams, id: string) => `/dashboard/orders/${id}`,
    },
    audit: { action: "refund.approved" },
  },
  // ---------------------------------------------------------------------------
  // DELIVERY
  // ---------------------------------------------------------------------------
  "delivery.failed": {
    notification: {
      title: "Delivery Failed",
      body: (p: DeliveryFailedParams) => `Delivery for Order #${p.orderNumber} failed. Reason: ${p.reason}`,
      severity: "critical",
      actionUrl: (_p: DeliveryFailedParams, id: string) => `/dashboard/orders/${id}`,
    },
    audit: { action: "delivery.failed" },
  },
  // ---------------------------------------------------------------------------
  // DISPUTES
  // ---------------------------------------------------------------------------
  "dispute.opened": {
    notification: {
      title: "Dispute Opened",
      body: (p: DisputeOpenedParams) => `A new dispute has been opened for transaction ${p.transactionId}.`,
      severity: "critical",
      actionUrl: (_p: DisputeOpenedParams, id: string) => `/dashboard/disputes/${id}`,
    },
    audit: { action: "dispute.opened" },
  },
  "dispute.evidence_required": {
    notification: {
      title: "Evidence Required",
      body: (p: DisputeEvidenceRequiredParams) => `Action required for dispute on Order #${p.orderNumber}. Due by: ${p.dueDate}`,
      severity: "critical",
      actionUrl: (_p: DisputeEvidenceRequiredParams, id: string) => `/dashboard/disputes/${id}`,
    },
  },
  // ---------------------------------------------------------------------------
  // SYSTEM / CONFIG
  // ---------------------------------------------------------------------------
  "settings.updated": {
    audit: { action: "settings.updated" },
  },
  "plan.changed": {
    notification: {
      title: "Plan Updated",
      body: (p: PlanChangedParams) => `Your store is now on the ${p.planName} plan.`,
      severity: "success",
      actionUrl: "/dashboard/settings/billing",
    },
    audit: { action: "billing.plan_changed" },
  },
  "consent.settings_changed": {
    audit: { action: "consent.settings_changed" },
  },
  // ---------------------------------------------------------------------------
  // KYC
  // ---------------------------------------------------------------------------
  "kyc.submitted": {
    notification: {
      title: "New KYC Submission",
      body: (p: KYCSubmittedParams) => `Merchant submitted KYC for review. NIN: ${p.ninMasked}, CAC: ${p.cacNumber || "N/A"}.`,
      severity: "info",
      actionUrl: (p: KYCSubmittedParams) => `/ops-console/kyc/${p.merchantId}`,
    },
    audit: { action: "kyc.submitted_for_review" },
  },
};
