import { PaymentStatus, DisputeStatus, RefundStatus } from "../types";

const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.INITIATED]: [
    PaymentStatus.PENDING,
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.REVIEW_REQUIRED,
  ],
  [PaymentStatus.PENDING]: [
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.REVIEW_REQUIRED,
  ],
  [PaymentStatus.VERIFIED]: [
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.REVIEW_REQUIRED,
  ],
  [PaymentStatus.SUCCESS]: [
    PaymentStatus.REFUNDED,
    PaymentStatus.DISPUTED,
  ],
  [PaymentStatus.FAILED]: [
    PaymentStatus.INITIATED, // Allow retry by creating new or resetting
  ],
  [PaymentStatus.REVIEW_REQUIRED]: [
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.REFUNDED,
  ],
  [PaymentStatus.REFUNDED]: [],
  [PaymentStatus.DISPUTED]: [
    PaymentStatus.SUCCESS, // If won
    PaymentStatus.REFUNDED, // If lost and refunded
  ],
};

const ALLOWED_DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  [DisputeStatus.OPENED]: [
    DisputeStatus.EVIDENCE_REQUIRED,
    DisputeStatus.EVIDENCE_SUBMITTED,
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.WON,
    DisputeStatus.LOST,
    DisputeStatus.CANCELLED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.EVIDENCE_REQUIRED]: [
    DisputeStatus.EVIDENCE_SUBMITTED,
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.WON,
    DisputeStatus.LOST,
    DisputeStatus.CANCELLED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.SUBMITTED]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.WON,
    DisputeStatus.LOST,
    DisputeStatus.CANCELLED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.EVIDENCE_SUBMITTED]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.WON,
    DisputeStatus.LOST,
    DisputeStatus.CANCELLED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.UNDER_REVIEW]: [
    DisputeStatus.WON,
    DisputeStatus.LOST,
    DisputeStatus.CANCELLED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.WON]: [DisputeStatus.CLOSED],
  [DisputeStatus.LOST]: [DisputeStatus.CLOSED],
  [DisputeStatus.CANCELLED]: [DisputeStatus.CLOSED],
  [DisputeStatus.CLOSED]: [],
};

const ALLOWED_REFUND_TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  [RefundStatus.REQUESTED]: [
    RefundStatus.APPROVED,
    RefundStatus.FAILED,
    RefundStatus.CANCELLED,
    RefundStatus.PROCESSING,
  ],
  [RefundStatus.APPROVED]: [
    RefundStatus.PROCESSING,
    RefundStatus.CANCELLED,
    RefundStatus.FAILED,
  ],
  [RefundStatus.PROCESSING]: [
    RefundStatus.SUCCESS,
    RefundStatus.FAILED,
  ],
  [RefundStatus.SUCCESS]: [],
  [RefundStatus.FAILED]: [
    RefundStatus.REQUESTED, // Allow retry
    RefundStatus.APPROVED,
  ],
  [RefundStatus.CANCELLED]: [],
};

export function canTransitionPayment(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_PAYMENT_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function ensurePaymentTransition(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus
): void {
  if (!canTransitionPayment(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid payment transition from ${currentStatus} to ${nextStatus}`
    );
  }
}

export function canTransitionDispute(
  currentStatus: DisputeStatus,
  nextStatus: DisputeStatus
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_DISPUTE_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function ensureDisputeTransition(
  currentStatus: DisputeStatus,
  nextStatus: DisputeStatus
): void {
  if (!canTransitionDispute(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid dispute transition from ${currentStatus} to ${nextStatus}`
    );
  }
}

export function canTransitionRefund(
  currentStatus: RefundStatus,
  nextStatus: RefundStatus
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_REFUND_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function ensureRefundTransition(
  currentStatus: RefundStatus,
  nextStatus: RefundStatus
): void {
  if (!canTransitionRefund(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid refund transition from ${currentStatus} to ${nextStatus}`
    );
  }
}
