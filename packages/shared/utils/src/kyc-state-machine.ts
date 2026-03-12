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

export type KycCheckStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

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
export function computeKycStatus(input: ComputeKycInput): KycCheckStatus {
  const { checks, isRegisteredBusiness } = input;

  const requiredChecks: KycCheckStatus[] = [checks.ninStatus, checks.bvnStatus];
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
export function isRegisteredBusiness(
  businessType: string | null | undefined,
): boolean {
  return businessType === "REGISTERED";
}

/**
 * Get a human-readable label for a KYC check status.
 */
export function kycStatusLabel(status: KycCheckStatus): string {
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
export function getRequiredKycChecks(
  businessType: string | null | undefined,
): string[] {
  const checks = ["NIN", "BVN"];
  if (isRegisteredBusiness(businessType)) {
    checks.push("CAC");
  }
  return checks;
}
