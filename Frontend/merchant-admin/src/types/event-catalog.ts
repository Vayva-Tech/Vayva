/**
 * Event Catalog Types
 * Type definitions for notification and audit event parameters
 */

// ============================================================================
// Order Event Parameters
// ============================================================================

export interface OrderCreatedParams {
  orderNumber: string;
  currency: string;
  totalAmount: string | number;
  customerName: string;
}

export interface OrderCancelledParams {
  orderNumber: string;
}

export interface OrderRefundRequestedParams {
  orderNumber: string;
}

export interface OrderRefundApprovedParams {
  orderNumber: string;
}

// ============================================================================
// Delivery Event Parameters
// ============================================================================

export interface DeliveryFailedParams {
  orderNumber: string;
  reason: string;
}

// ============================================================================
// Dispute Event Parameters
// ============================================================================

export interface DisputeOpenedParams {
  transactionId: string;
}

export interface DisputeEvidenceRequiredParams {
  orderNumber: string;
  dueDate: string;
}

// ============================================================================
// Billing/Plan Event Parameters
// ============================================================================

export interface PlanChangedParams {
  planName: string;
}

// ============================================================================
// KYC Event Parameters
// ============================================================================

export interface KYCSubmittedParams {
  ninMasked: string;
  cacNumber?: string | null;
  merchantId: string;
}

// ============================================================================
// Event Parameter Union Type
// ============================================================================

export type EventParams =
  | OrderCreatedParams
  | OrderCancelledParams
  | OrderRefundRequestedParams
  | OrderRefundApprovedParams
  | DeliveryFailedParams
  | DisputeOpenedParams
  | DisputeEvidenceRequiredParams
  | PlanChangedParams
  | KYCSubmittedParams
  | Record<string, unknown>; // Fallback for unknown params

// ============================================================================
// Notification/Action URL Function Types
// ============================================================================

export type NotificationBodyFn<T = EventParams> = (params: T) => string;
export type ActionUrlFn<T = EventParams> = (params: T, id: string) => string;
