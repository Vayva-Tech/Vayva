/**
 * Centralized KYC State Machine
 *
 * Computes the overall KYC status from per-check statuses.
 * This is the SINGLE SOURCE OF TRUTH for KYC status derivation.
 *
 * Rules:
 *   Individual merchant: NIN VERIFIED + BVN VERIFIED → VERIFIED
 *   Registered business: NIN VERIFIED + BVN VERIFIED + CAC VERIFIED → VERIFIED
 *   Any check REJECTED → REJECTED
 *   Any check PENDING (and none rejected) → PENDING
 *   Otherwise → NOT_STARTED
 */
export type KycCheckStatus = "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";
export interface KycCheckStatuses {
    ninStatus: KycCheckStatus;
    bvnStatus: KycCheckStatus;
    cacStatus: KycCheckStatus;
}
export interface ComputeKycInput {
    checks: KycCheckStatuses;
    /** Whether the merchant is a registered business (CAC required) */
    isRegisteredBusiness: boolean;
}
/**
 * Compute the overall KYC status from individual check statuses.
 */
export declare function computeKycStatus(input: ComputeKycInput): KycCheckStatus;
/**
 * Determine if a store requires CAC based on its businessType field.
 */
export declare function isRegisteredBusiness(businessType: string | null | undefined): boolean;
/**
 * Get a human-readable label for a KYC check status.
 */
export declare function kycStatusLabel(status: KycCheckStatus): string;
/**
 * Get the list of required KYC checks for a merchant.
 */
export declare function getRequiredKycChecks(businessType: string | null | undefined): string[];
//# sourceMappingURL=kyc-state-machine.d.ts.map