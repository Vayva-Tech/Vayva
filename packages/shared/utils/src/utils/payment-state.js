"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransitionPayment = canTransitionPayment;
exports.ensurePaymentTransition = ensurePaymentTransition;
exports.canTransitionDispute = canTransitionDispute;
exports.ensureDisputeTransition = ensureDisputeTransition;
exports.canTransitionRefund = canTransitionRefund;
exports.ensureRefundTransition = ensureRefundTransition;
const types_1 = require("../types");
const ALLOWED_PAYMENT_TRANSITIONS = {
    [types_1.PaymentStatus.INITIATED]: [
        types_1.PaymentStatus.PENDING,
        types_1.PaymentStatus.SUCCESS,
        types_1.PaymentStatus.FAILED,
        types_1.PaymentStatus.REVIEW_REQUIRED,
    ],
    [types_1.PaymentStatus.PENDING]: [
        types_1.PaymentStatus.SUCCESS,
        types_1.PaymentStatus.FAILED,
        types_1.PaymentStatus.REVIEW_REQUIRED,
    ],
    [types_1.PaymentStatus.VERIFIED]: [
        types_1.PaymentStatus.SUCCESS,
        types_1.PaymentStatus.FAILED,
        types_1.PaymentStatus.REVIEW_REQUIRED,
    ],
    [types_1.PaymentStatus.SUCCESS]: [types_1.PaymentStatus.REFUNDED, types_1.PaymentStatus.DISPUTED],
    [types_1.PaymentStatus.FAILED]: [
        types_1.PaymentStatus.INITIATED, // Allow retry by creating new or resetting
    ],
    [types_1.PaymentStatus.REVIEW_REQUIRED]: [
        types_1.PaymentStatus.SUCCESS,
        types_1.PaymentStatus.FAILED,
        types_1.PaymentStatus.REFUNDED,
    ],
    [types_1.PaymentStatus.REFUNDED]: [],
    [types_1.PaymentStatus.DISPUTED]: [
        types_1.PaymentStatus.SUCCESS, // If won
        types_1.PaymentStatus.REFUNDED, // If lost and refunded
    ],
};
const ALLOWED_DISPUTE_TRANSITIONS = {
    [types_1.DisputeStatus.OPENED]: [
        types_1.DisputeStatus.EVIDENCE_REQUIRED,
        types_1.DisputeStatus.EVIDENCE_SUBMITTED,
        types_1.DisputeStatus.UNDER_REVIEW,
        types_1.DisputeStatus.WON,
        types_1.DisputeStatus.LOST,
        types_1.DisputeStatus.CANCELLED,
        types_1.DisputeStatus.CLOSED,
    ],
    [types_1.DisputeStatus.EVIDENCE_REQUIRED]: [
        types_1.DisputeStatus.EVIDENCE_SUBMITTED,
        types_1.DisputeStatus.UNDER_REVIEW,
        types_1.DisputeStatus.WON,
        types_1.DisputeStatus.LOST,
        types_1.DisputeStatus.CANCELLED,
        types_1.DisputeStatus.CLOSED,
    ],
    [types_1.DisputeStatus.SUBMITTED]: [
        types_1.DisputeStatus.UNDER_REVIEW,
        types_1.DisputeStatus.WON,
        types_1.DisputeStatus.LOST,
        types_1.DisputeStatus.CANCELLED,
        types_1.DisputeStatus.CLOSED,
    ],
    [types_1.DisputeStatus.EVIDENCE_SUBMITTED]: [
        types_1.DisputeStatus.UNDER_REVIEW,
        types_1.DisputeStatus.WON,
        types_1.DisputeStatus.LOST,
        types_1.DisputeStatus.CANCELLED,
        types_1.DisputeStatus.CLOSED,
    ],
    [types_1.DisputeStatus.UNDER_REVIEW]: [
        types_1.DisputeStatus.WON,
        types_1.DisputeStatus.LOST,
        types_1.DisputeStatus.CANCELLED,
        types_1.DisputeStatus.CLOSED,
    ],
    [types_1.DisputeStatus.WON]: [types_1.DisputeStatus.CLOSED],
    [types_1.DisputeStatus.LOST]: [types_1.DisputeStatus.CLOSED],
    [types_1.DisputeStatus.CANCELLED]: [types_1.DisputeStatus.CLOSED],
    [types_1.DisputeStatus.CLOSED]: [],
};
const ALLOWED_REFUND_TRANSITIONS = {
    [types_1.RefundStatus.REQUESTED]: [
        types_1.RefundStatus.APPROVED,
        types_1.RefundStatus.FAILED,
        types_1.RefundStatus.CANCELLED,
        types_1.RefundStatus.PROCESSING,
    ],
    [types_1.RefundStatus.APPROVED]: [
        types_1.RefundStatus.PROCESSING,
        types_1.RefundStatus.CANCELLED,
        types_1.RefundStatus.FAILED,
    ],
    [types_1.RefundStatus.PROCESSING]: [types_1.RefundStatus.SUCCESS, types_1.RefundStatus.FAILED],
    [types_1.RefundStatus.SUCCESS]: [],
    [types_1.RefundStatus.FAILED]: [
        types_1.RefundStatus.REQUESTED, // Allow retry
        types_1.RefundStatus.APPROVED,
    ],
    [types_1.RefundStatus.CANCELLED]: [],
};
function canTransitionPayment(currentStatus, nextStatus) {
    if (currentStatus === nextStatus)
        return true;
    const allowed = ALLOWED_PAYMENT_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
}
function ensurePaymentTransition(currentStatus, nextStatus) {
    if (!canTransitionPayment(currentStatus, nextStatus)) {
        throw new Error(`Invalid payment transition from ${currentStatus} to ${nextStatus}`);
    }
}
function canTransitionDispute(currentStatus, nextStatus) {
    if (currentStatus === nextStatus)
        return true;
    const allowed = ALLOWED_DISPUTE_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
}
function ensureDisputeTransition(currentStatus, nextStatus) {
    if (!canTransitionDispute(currentStatus, nextStatus)) {
        throw new Error(`Invalid dispute transition from ${currentStatus} to ${nextStatus}`);
    }
}
function canTransitionRefund(currentStatus, nextStatus) {
    if (currentStatus === nextStatus)
        return true;
    const allowed = ALLOWED_REFUND_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
}
function ensureRefundTransition(currentStatus, nextStatus) {
    if (!canTransitionRefund(currentStatus, nextStatus)) {
        throw new Error(`Invalid refund transition from ${currentStatus} to ${nextStatus}`);
    }
}
//# sourceMappingURL=payment-state.js.map