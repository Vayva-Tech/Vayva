// Central mapping of system events to Notification and Audit actions
export const EVENT_CATALOG = {
  // ---------------------------------------------------------------------------
  // ORDERS
  // ---------------------------------------------------------------------------
  "order.created": {
    notification: {
      title: "New Order Received",
      body: (p: Record<string, string>) =>
        `Order #${p.orderNumber} for ${p.currency} ${p.totalAmount} was placed by ${p.customerName}.`,
      severity: "success",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/orders/${id}`,
    },
  },
  "order.paid": {
    audit: { action: "order.payment_confirmed" },
  },
  "order.cancelled": {
    audit: { action: "order.cancelled" },
    notification: {
      title: "Order Cancelled",
      body: (p: Record<string, string>) =>
        `Order #${p.orderNumber} was cancelled.`,
      severity: "warning",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/orders/${id}`,
    },
  },
  "order.refund_requested": {
    notification: {
      title: "Refund Requested",
      body: (p: Record<string, string>) =>
        `Customer requested a refund for Order #${p.orderNumber}.`,
      severity: "warning",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/orders/${id}/refunds`,
    },
    audit: { action: "refund.requested" },
  },
  "order.refund_approved": {
    notification: {
      title: "Refund Approved",
      body: (p: Record<string, string>) =>
        `Refund for Order #${p.orderNumber} has been approved.`,
      severity: "info",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/orders/${id}`,
    },
    audit: { action: "refund.approved" },
  },
  // ---------------------------------------------------------------------------
  // DELIVERY
  // ---------------------------------------------------------------------------
  "delivery.failed": {
    notification: {
      title: "Delivery Failed",
      body: (p: Record<string, string>) =>
        `Delivery for Order #${p.orderNumber} failed. Reason: ${p.reason}`,
      severity: "critical",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/orders/${id}`, // Link to order context
    },
    audit: { action: "delivery.failed" },
  },
  // ---------------------------------------------------------------------------
  // DISPUTES
  // ---------------------------------------------------------------------------
  "dispute.opened": {
    notification: {
      title: "Dispute Opened",
      body: (p: Record<string, string>) =>
        `A new dispute has been opened for transaction ${p.transactionId}.`,
      severity: "critical",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/disputes/${id}`,
    },
    audit: { action: "dispute.opened" },
  },
  "dispute.evidence_required": {
    notification: {
      title: "Evidence Required",
      body: (p: Record<string, string>) =>
        `Action required for dispute on Order #${p.orderNumber}. Due by: ${p.dueDate}`,
      severity: "critical",
      actionUrl: (p: Record<string, string>, id: string) =>
        `/dashboard/disputes/${id}`,
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
      body: (p: Record<string, string>) =>
        `Your store is now on the ${p.planName} plan.`,
      severity: "success",
      actionUrl: "/dashboard/settings/billing",
    },
    audit: { action: "billing.plan_changed" },
  },
  "consent.settings_changed": {
    audit: { action: "consent.settings_changed" },
  },
};
