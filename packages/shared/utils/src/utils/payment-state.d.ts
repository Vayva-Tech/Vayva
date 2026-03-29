import { PaymentStatus, DisputeStatus, RefundStatus } from "../types";
export declare function canTransitionPayment(currentStatus: PaymentStatus, nextStatus: PaymentStatus): boolean;
export declare function ensurePaymentTransition(currentStatus: PaymentStatus, nextStatus: PaymentStatus): void;
export declare function canTransitionDispute(currentStatus: DisputeStatus, nextStatus: DisputeStatus): boolean;
export declare function ensureDisputeTransition(currentStatus: DisputeStatus, nextStatus: DisputeStatus): void;
export declare function canTransitionRefund(currentStatus: RefundStatus, nextStatus: RefundStatus): boolean;
export declare function ensureRefundTransition(currentStatus: RefundStatus, nextStatus: RefundStatus): void;
//# sourceMappingURL=payment-state.d.ts.map