"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeKycStatus = computeKycStatus;
exports.isRegisteredBusiness = isRegisteredBusiness;
exports.kycStatusLabel = kycStatusLabel;
exports.getRequiredKycChecks = getRequiredKycChecks;
/**
 * Compute the overall KYC status from individual check statuses.
 */
function computeKycStatus(input) {
    const { checks, isRegisteredBusiness } = input;
    const requiredChecks = [checks.ninStatus, checks.bvnStatus];
    if (isRegisteredBusiness) {
        requiredChecks.push(checks.cacStatus);
    }
    // Any rejection → overall REJECTED
    if (requiredChecks.some((s) => s === "REJECTED")) {
        return "REJECTED";
    }
    // All verified → overall VERIFIED
    if (requiredChecks.every((s) => s === "VERIFIED")) {
        return "VERIFIED";
    }
    // Any pending → overall PENDING
    if (requiredChecks.some((s) => s === "PENDING")) {
        return "PENDING";
    }
    return "NOT_STARTED";
}
/**
 * Determine if a store requires CAC based on its businessType field.
 */
function isRegisteredBusiness(businessType) {
    return businessType === "REGISTERED";
}
/**
 * Get a human-readable label for a KYC check status.
 */
function kycStatusLabel(status) {
    switch (status) {
        case "NOT_STARTED":
            return "Not Started";
        case "PENDING":
            return "Pending Review";
        case "VERIFIED":
            return "Verified";
        case "REJECTED":
            return "Rejected";
        default:
            return "Unknown";
    }
}
/**
 * Get the list of required KYC checks for a merchant.
 */
function getRequiredKycChecks(businessType) {
    const checks = ["NIN", "BVN"];
    if (isRegisteredBusiness(businessType)) {
        checks.push("CAC");
    }
    return checks;
}
//# sourceMappingURL=kyc-state-machine.js.map